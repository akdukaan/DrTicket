The bot must be invited with two scopes: `bot` and `applications.commands`.

The bot should have server members intent.

Remember to create a .env file with the client token as the KEY

Todo before release:
1. Make it so that by default, /setup & /settranscriptchannel can not be used by the everyone role
2. When someone leaves the discord server, call the close command on their ticket if they had one
3. Create a function isStaff(member) that determines if member has permission to write in the tickets category (check the category permissions and not just a random ticket's permission).
4. Make ticket expirations kept in the same row as the ticket instead of what i was initially trying to do having a separate table for it
5. When someone who isStaff sends a message in a ticket channel, set the ticket expiration to 48h from now. Also, add a row in the drafts table 24h from now for the ticket with a message like "This ticket has been inactive for 24h and will be closed in 24h more. Send a message to cancel inactivity."
6. When someone who !isStaff sends a message in a ticket channel, set the ticket expiration to null and clear the drafts table of any items matching the ticket.
7. On startup of the bot, check all tickets to see if the expiry time has passed. Use the close command on those tickets. Also, check all items in the drafts table to see if the execution time has passed. Send all of those drafts and then remove the row from the table.
8. Every ~1 min, check to see if any tickets should expire, or if any drafts should send. If so, close the ticket or send the draft.
9. the /resolved command. usable only by people who isStaff. Sets the ticket's expiry to 12h and immediately sends a message in the channel like "this ticket has been marked as resovled and will close after 12h". Also clears drafts table from any msgs that were scheduled to send in that channel
10. the /persist command. usable only by people who isStaff. Sets the ticket's expiry to -1 (different from null because I want -1 to also mean that it doesn't do 3b or 3c) and clears the drafts table from any msgs that were scheduled to send in that channel
11. the /unpersist command. usable only by people who isStaff. Sets the ticket's expiry to 48h from now . Also, add a row in the drafts table 24h from now for the ticket with a message like "This ticket has been inactive for over 24h and will be closed in 24h more. Send a message to cancel inactivity."

Todo after release:
12. Option to customize messages and expiration times
