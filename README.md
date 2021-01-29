# delta-notifier

An app to notify the user or client whenever a new version of the app is deployed in heroku or netlify.

## Prerequisite

You will need a MongoDB hosted.

## Config

Create an env file and add the required config variables.

- AUTH_TOKEN
- HEADER_AUTH_TOKEN [For Heroku].
- NETLIFY_JWT_SECRET_KEY [For Netlify]
- MongoDB Credentials
- Email Credentials

## Usage

### Local Testing

```bash
git clone https://github.com/arsadmd13/delta-notifier.git
cd delta-notifier
npm i
npm run start
```
If you have sample data of netlify/heroku webhooks send them through post on postman

### Deployment (Heroku)

#### New App
```bash
heroku create
git push heroku main
```

#### Existing App

```bash
heroku git:remote -a appname
git push heroku main
```

### Linking heroku/netlify app

- [Heroku](https://devcenter.heroku.com/articles/app-webhooks)
- [Netlify](https://docs.netlify.com/site-deploys/notifications/)

#### URL Format

https://website.com/api/notify/heroku/TOKEN

## Thanks for checking this out 🤙