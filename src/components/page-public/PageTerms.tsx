import { Typography } from "antd";
import { Link } from "react-router-dom";

import PolicyPage, { Contact } from "./PolicyPage";

const { Title, Paragraph } = Typography;

export default function PageTerms() {
  return (
    <PolicyPage title="Terms of use" updated="November 27, 2026">
      <Paragraph>
        By creating an account or using WeeklyPulls, you agree to these terms. Please also read the{" "}
        <Link to="/privacy">privacy policy</Link>.
      </Paragraph>

      <Title level={3}>The service</Title>
      <Paragraph>
        WeeklyPulls is a free, independently run hobby project. It&apos;s provided as is, without
        any warranty: comic information can be incomplete or wrong, and the site may sometimes be
        unavailable. We may change or shut down the service. If we shut it down, we&apos;ll try to
        give notice so you can download your data first.
      </Paragraph>

      <Title level={3}>Your account</Title>
      <ul>
        <li>Use a real email address that you control.</li>
        <li>
          Keep your password to yourself. You&apos;re responsible for what happens under your
          account.
        </li>
        <li>You can delete your account at any time from the Account page.</li>
      </ul>

      <Title level={3}>Acceptable use</Title>
      <Paragraph>Please don&apos;t:</Paragraph>
      <ul>
        <li>try to access other people&apos;s accounts or data;</li>
        <li>attack, overload, or try to break the site, or get around its limits;</li>
        <li>scrape it or access it with automated tools in bulk;</li>
        <li>use it for anything illegal.</li>
      </ul>
      <Paragraph>We may suspend or delete accounts that do these things.</Paragraph>

      <Title level={3}>Comic information</Title>
      <Paragraph>
        Comic data and cover images come from Comic Vine and belong to their respective owners.
        WeeklyPulls isn&apos;t affiliated with Comic Vine or any publisher.
      </Paragraph>

      <Title level={3}>Liability</Title>
      <Paragraph>
        To the extent the law allows, WeeklyPulls and the people who run it aren&apos;t liable for
        any loss or damage from using the service, including lost data.
      </Paragraph>

      <Title level={3}>Changes and contact</Title>
      <Paragraph>
        If these terms change, we&apos;ll update them here and change the date at the top.
        Questions? Contact <Contact />.
      </Paragraph>
    </PolicyPage>
  );
}
