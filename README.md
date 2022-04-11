The bot must be invited with two scopes: `bot` and `applications.commands`.

The bot should have server members intent.

Remember to create a .env file with the client token as the KEY

Todo (Simple):
1. Make it so commands cannot be used in dms
2. Make it so /setup and /settranscript can only be used by people with ADMINISTRATOR permissions
3. When someone leaves, call the close command on their ticket

Todo (Harder):
1. A system for inactivity
    When a message is sent in a ticket channel:
        If it was sent by someone who has access to the category, we assume they are staff and do:
            Set the ticket expiration to 48h
        Else:
            Remove their ticket from the expirations table
            Remove their ticket from the drafts table
    
    On startup, some more stuff regarding actually activiating expirations and drafts
2. /persist command, (after doing above)
3. Option to customize messages and expiration times?