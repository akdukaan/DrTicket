
const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId } = require('./config.json');
const sqlite3 = require('sqlite3');
require('dotenv').config()

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
	createDatabases()
    var currentdate = new Date(); 
    console.log(currentdate)
    require("./deploy-commands")
});

const createDatabases = () => {
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        if (err) { 
            console.log('Error when creating the database', err) 
        } else { 
            // Create tables for each guild tickets
            console.log('Database created!')
            let guilds = client.guilds.cache
            guilds.forEach(g => {
                db.run(`CREATE TABLE IF NOT EXISTS tickets${g.id}(channel TEXT PRIMARY KEY, creator TEXT NOT NULL)`);
            })
            // Create drafts table
            db.run(`CREATE TABLE IF NOT EXISTS drafts(id INTEGER PRIMARY KEY, guild TEXT, channel TEXT, message TEXT, triggertime TIMESTAMP)`);
            // Create expirations table
            db.run(`CREATE TABLE IF NOT EXISTS expirations(channel TEXT PRIMARY KEY, guild TEXT, triggertime TIMESTAMP)`);
			// Create guilds table
			db.run(`CREATE TABLE IF NOT EXISTS guilds(guild TEXT PRIMARY KEY, transcript TEXT, category TEXT, counter INT)`);

        } 
    })
    db.close();
}


client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// When someone leaves, do same thing as close command

// When someone says something in a ticket channel
// If they have access to the category, set their expiry to 48h (add item to expiry table)
// Else set their expiry to null (remove item from the expiry table)

// When someone clicks a createticket button, if they need a ticket, make one for them


client.login(process.env.KEY);
