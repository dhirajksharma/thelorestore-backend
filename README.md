# The Lore Store (Backend)
The Lore Store is an online bookstore, this repository holds the code for the backend of the same. Here, is the [frontend repository](https://github.com/dhirajksharma/thelorestore-frontend) for the project. I have used **Express.js** for the server with **MongoDB** as my database program and **Mongoose** is my preferred choice of ODM.

## Features Available Now

Some of the prominent features of the site include:

a) General features available to all users
- Search a book in the store.
- Filter the results based on price, reviews, date of arrival, etc.
- Explore different genres available.
- Edit their profile information like name, email, address, etc.
- Edit their passwords, reset forgotten passwords with email.
- Compare different sellers and choose which one to buy from.
- Add, remove and/or update reviews for books.
- Add books to cart for later purchase.
- Check out with payment at Stripe's payment gateway.
- Check order details, cancel undelivered orders.

b) Seller exclusive features

- Add new to their catalogue.
- Update existing books in their catalogue.
- Check orders received from various buyers.

## Future Prospects

I have a couple of updates in mind for the site, which all of you are welcome to contribute to, or maybe even add new ones . . .

- Wish list for Users to add or remove books from.
- Social page for Users to share their reads with others.
- Sales statistics for Sellers at their dashboard.
- Dedicated pages for Sellers to host sales or launch events.
- A new section of users: delivery partners, and various functionalities associated with them, for instance, receiving orders for delivery, order tracking functionality for the user.
- Feel free to add more 😁😁

## Environment Variables

Below is the list of environment variables required for the frontend:

- PORT
- DB_URI
- MONGO_URI
- JWT_SECRET
- JWT_EXPIRE
- COOKIE_EXPIRE
- SMPT_SERVICE
- SMPT_MAIL
- SMPT_PASS
- FRONTEND
- STRIPE_SK
- STRIPE_SUCCESS_URL
- STRIPE_FAIL_URL

> **Note:** Create the env file in the root directory with the name ".env". This is because of how the dotenv modules config method works. The default value for path is `path.resolve(process.cwd(), '.env')` If you are keeping your env file elsewhere or with a certain name, then you will need to pass the path to the method accordingly. However, I would recommend the former approach since hosting platforms (like Render and Vercel which I have used) will add the ".env" file to your root directory. So, doing a similar thing in your development will eliminate unnecessary conditionals in the code.