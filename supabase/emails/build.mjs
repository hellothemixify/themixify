/**
 * Generates the four authentication email templates from _layout.html.
 *
 * They are near-identical by design — same shell, same button, four different
 * sentences — so keeping four hand-maintained copies would mean four places to
 * forget when the shell changes. Edit _layout.html or the table below, run
 * `node supabase/emails/build.mjs`, and paste the output into the Supabase
 * dashboard under Authentication → Emails.
 *
 * The generated files are committed. Anyone should be able to see exactly what
 * lands in a customer's inbox without running anything.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const layout = readFileSync(join(here, '_layout.html'), 'utf8')

/**
 * The copy. Written to be read by someone who is mildly annoyed at having to
 * deal with an email at all: what this is, what it does, how long it lasts,
 * and what happens if they ignore it — in that order, in one short paragraph.
 */
const TEMPLATES = [
  {
    file: 'confirm-signup.html',
    subject: 'Confirm your Themixify account',
    preview: 'One click and your account is ready.',
    heading: 'Confirm your email',
    body: 'You created a Themixify account with this address. Confirm it and your licences, downloads and site activations are ready to use.',
    button: 'Confirm my email',
    footnote:
      'If you did not sign up, you can ignore this — the address is not added to anything until it is confirmed.',
  },
  {
    file: 'reset-password.html',
    subject: 'Reset your Themixify password',
    preview: 'A link to set a new password, good for one hour.',
    heading: 'Reset your password',
    body: 'Someone asked to reset the password for the Themixify account on this address. Use the link below to set a new one. It works once and expires in an hour.',
    button: 'Set a new password',
    footnote:
      'If this was not you, nothing has changed and your current password still works. You can safely ignore this email.',
  },
  {
    file: 'magic-link.html',
    subject: 'Your Themixify sign-in link',
    preview: 'Sign in without typing a password.',
    heading: 'Your sign-in link',
    body: 'Use the link below to sign in to Themixify — no password needed. It works once and expires in an hour.',
    button: 'Sign me in',
    footnote:
      'If you did not ask to sign in, ignore this email. The link is useless without this inbox.',
  },
  {
    file: 'change-email.html',
    subject: 'Confirm your new Themixify email address',
    preview: 'Confirm the change to finish moving your account.',
    heading: 'Confirm your new address',
    body: 'A request was made to change the email on your Themixify account to {{ .NewEmail }}. Confirm it below and it becomes the address you sign in with.',
    button: 'Confirm the change',
    footnote:
      'If you did not ask for this, ignore it — the change does not take effect until it is confirmed, and your current address keeps working.',
  },
]

for (const template of TEMPLATES) {
  const html = layout
    // Strip the explanatory comment block; it is guidance for whoever edits the
    // layout, not something to ship to an inbox.
    .replace(/<!--[\s\S]*?-->\n/, '')
    .replace('PREVIEW_TEXT', template.preview)
    .replace('HEADING', template.heading)
    .replace('BODY', template.body)
    .replace('BUTTON_LABEL', template.button)
    .replace('FOOTNOTE', template.footnote)

  writeFileSync(join(here, template.file), html)
  console.log(`${template.file.padEnd(24)} subject: ${template.subject}`)
}
