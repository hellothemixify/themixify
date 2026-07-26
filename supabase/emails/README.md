# Authentication emails

The four templates in this directory are what a customer should receive when
they confirm an address, reset a password, request a sign-in link, or change
their email. They are generated from `_layout.html` by `build.mjs`:

```bash
node supabase/emails/build.mjs
```

## Before they can be used: custom SMTP

Supabase no longer lets a project edit its email templates while it is on the
built-in email service. The dashboard shows the subject and body fields greyed
out with:

> Set up custom SMTP to edit templates — Emails will be sent using the default
> templates. Set up custom SMTP to edit their subject and body.

So until an SMTP provider is connected, every authentication email goes out in
Supabase's plain default styling, and nothing in this directory is in play.

This is not only a branding problem. The built-in service is explicitly not for
production: it is rate limited to a couple of messages per hour, and it sends
from a shared Supabase address that has no relationship to this domain, which is
exactly the profile a spam filter is built to catch. A launch that relies on it
will drop password resets on the floor.

## Setting it up

1. Create an account with a transactional email provider — Resend, Postmark,
   SendGrid, Brevo and Amazon SES all have a free tier that covers early
   volumes. Resend is the least work for a domain that is already on Cloudflare.
2. Verify `themixify.com` there and add the DNS records it asks for (SPF, DKIM,
   and usually a return-path CNAME). Without these the mail is signed by nobody
   and lands in spam regardless of who sends it.
3. In Supabase: **Authentication → Emails → SMTP Settings**, enable custom SMTP
   and enter the host, port, username and password from the provider. Set the
   sender to something at `themixify.com` — `support@` or `no-reply@` — and the
   sender name to `Themixify`.
4. The template fields unlock. For each of the four, paste the matching file
   here into the **Source** tab and set the subject:

   | Supabase template     | File                  | Subject                                       |
   | --------------------- | --------------------- | --------------------------------------------- |
   | Confirm sign up       | `confirm-signup.html` | Confirm your Themixify account                |
   | Reset password        | `reset-password.html` | Reset your Themixify password                 |
   | Magic link or OTP     | `magic-link.html`     | Your Themixify sign-in link                   |
   | Change email address  | `change-email.html`   | Confirm your new Themixify email address      |

5. Send yourself one of each and read it on a phone before calling it done.

## What is already configured

**Authentication → URL Configuration** is set, and it matters more than it
looks: `redirectTo` is ignored unless the URL is on the allow list, and the
visitor is silently dropped on the Site URL instead. With the list empty, a
password reset link landed on the homepage rather than on the form for setting a
new password — the flow looked fine right up until the moment it mattered.

- Site URL: `https://themixify.com`
- Redirect URLs: `https://themixify.com/**` and `http://localhost:3000/**`

## Why these templates look the way they do

Email clients are twenty years behind browsers and disagree with each other.
Outlook renders through Word, Gmail strips `<style>` blocks on forwarded mail,
and none of them can be relied on for flexbox, grid, custom properties or web
fonts. So everything is a table, every style is inline, and the palette is
copied out of `app/globals.css` as literals rather than referenced — the same
colours, hard-coded, because there is no other way to carry them into an inbox.

The action button is a table cell with a background colour rather than a styled
anchor, because a styled anchor collapses in Outlook. The link is repeated
underneath as plain text for the clients that strip the button entirely.
