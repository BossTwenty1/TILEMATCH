# Database Setup Instructions

To get the TileMatch backend running locally, follow these steps to set up your MySQL database.

## Prerequisites
- [MySQL Server](https://dev.mysql.com/downloads/installer/) installed and running.
- A MySQL client (like MySQL Workbench, HeidiSQL, or the `mysql` CLI).

## Setup Steps

1. **Create the Database & Schema**
   Open your MySQL client and run the following command (or import the file):
   ```bash
   mysql -u your_username -p < tilematch_schema.sql
   ```
   *This will create the `tilematch_db` database and all required tables.*

2. **Seed the Data (Highly Recommended)**
   To see products, categories, and sample orders on the site, run:
   ```bash
   mysql -u your_username -p tilematch_db < tilematch_seed.sql
   ```
   *Without this, the shop will be empty and some features (like the hero section) may not display correctly.*

3. **Configure the Server**
   - Go to the `server/` folder.
   - Copy `.env.example` to a new file named `.env`.
   - Update the `DB_USER` and `DB_PASSWORD` with your local MySQL credentials.

## Troubleshooting
- **Authentication Plugin Error:** If you get an 'Access denied' or authentication error, ensure your user has permissions to create databases.
- **Port Busy:** Ensure MySQL is running on the default port `3306` or update `DB_PORT` in your `.env`.
