import { Typography } from "antd";

import PolicyPage, { Contact } from "./PolicyPage";

const { Title, Paragraph } = Typography;

export default function PagePrivacy() {
  return (
    <PolicyPage title="Privacy policy" updated="November 27, 2026">
      <Paragraph>
        WeeklyPulls is a small, independently run website for keeping track of the comics you read.
        This page explains what information it keeps about you and why. The short version: only what
        it needs to run your account. No ads, no tracking, and your data is never sold.
      </Paragraph>

      <Title level={3}>What we collect</Title>
      <ul>
        <li>
          <strong>Your account:</strong> your username, email address, and password. Passwords are
          stored only as a secure one-way hash, so nobody can read them.
        </li>
        <li>
          <strong>What you track:</strong> your pull lists, the series on them, and which issues
          you&apos;ve marked read.
        </li>
        <li>
          <strong>In your browser:</strong> when you log in, a login token is saved in your
          browser&apos;s local storage so you stay logged in. A few display preferences are saved
          there too. WeeklyPulls doesn&apos;t use tracking cookies.
        </li>
        <li>
          <strong>Technical information:</strong> like most websites, our servers log requests
          (including IP addresses) to keep the service running and secure. If something breaks, an
          error report may include technical details such as your browser type and the page you were
          on.
        </li>
      </ul>

      <Title level={3}>How we use it</Title>
      <Paragraph>
        Only to run WeeklyPulls: to log you in, show you your lists, send account emails, and fix
        problems. The only emails we send are account emails, such as verifying your address or
        resetting your password. No newsletters or marketing.
      </Paragraph>

      <Title level={3}>Who else handles it</Title>
      <Paragraph>
        We use a few services to run the site. They handle your information only on our behalf:
      </Paragraph>
      <ul>
        <li>
          <strong>Railway</strong> hosts the website and its database.
        </li>
        <li>
          <strong>Amazon Web Services (Amazon SES)</strong> sends our emails, so it sees your email
          address and the emails we send you.
        </li>
        <li>
          <strong>Sentry</strong> receives error reports so we can fix bugs.
        </li>
      </ul>
      <Paragraph>
        Comic information (series, issues, covers) comes from Comic Vine. We don&apos;t send them
        anything about you. We don&apos;t share your information with anyone else unless the law
        requires it.
      </Paragraph>

      <Title level={3}>How long we keep it</Title>
      <Paragraph>
        Until you delete your account. When you do, your account, lists, and reading history are
        deleted from our database right away. Copies may remain in backups and logs for a limited
        time before they are overwritten.
      </Paragraph>

      <Title level={3}>Your choices</Title>
      <Paragraph>
        From your Account page you can download a copy of your data or permanently delete your
        account at any time. For anything else, such as changing your email address or asking about
        your data, contact <Contact />.
      </Paragraph>

      <Title level={3}>Children</Title>
      <Paragraph>WeeklyPulls isn&apos;t meant for children under 13.</Paragraph>

      <Title level={3}>Changes</Title>
      <Paragraph>
        If this policy changes, we&apos;ll update it here and change the date at the top.
      </Paragraph>
    </PolicyPage>
  );
}
