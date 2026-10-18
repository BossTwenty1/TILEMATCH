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
   - Generate `JWT_SECRET` using the command in `.env.example`; it must contain 32 random bytes encoded as 64 hex characters. Store it privately. The server refuses to start with missing or unsafe values.

## Critical fixes deployment prerequisites

- Existing databases: apply `migrations/20261018_order_number_uuid.sql` before deploying the new checkout. It widens `orders.order_number` to 40 characters and preserves existing numbers, records, and the unique index. Do not rerun schema or seed scripts against a live database.
- Admin reset scripts have been removed. The sample admin in fresh seed data is locked. No live account passwords are changed by these code changes.
- Treat admin passwords formerly embedded in repository scripts as exposed. Check affected live accounts privately and rotate any matching passwords through an approved process. A read-only check from this workspace could not resolve the configured database host, so live reuse is unconfirmed. Rotation requires separate approval.
- Configure a fresh private JWT secret before release if the fallback or any shared/example value was used. Replacing it invalidates existing sessions and requires users to sign in again.
- Checkout is an academic GCash simulation: the QR asset and recipient instructions are removed, client payment references are ignored, and the server creates `DEMO-` references. Existing payment records remain unchanged; no payment provider credentials are needed.
- Run `npm test` in `server/` for isolated regression tests. These tests use database and mail doubles. The existing integration/E2E suites write database records; use a separate disposable database for them.

## Troubleshooting
- **Authentication Plugin Error:** If you get an 'Access denied' or authentication error, ensure your user has permissions to create databases.
- **Port Busy:** Ensure MySQL is running on the default port `3306` or update `DB_PORT` in your `.env`.
