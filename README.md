# PrivacyPulse
Final Project for CS492
Privacy Pulse was originally planned to be an ecrypted chat system for my CS492 project, however, due to lack of time and complexity of a Diffie-Hellman exchange, it turned out to be an encrypted note system.
The way this web app currently runs is you will register/login and your password will be hashed and stored into a firebase database. Then you can send messages in this chat interface. These messages are encrypted and stored in our database, and the only way for it to get decrypted is via a secret key that gets added to you local machine. What this means is that unless someone was to get that secret key from your machine, no one, but you will know what your message says, even in the case of a database comprimise.
I do plan on working to update this project so that:

-It is hosted to a web server for ease of viewing.

-Getting the end to end encrypted chat system working via a diffie hellman exchange.
