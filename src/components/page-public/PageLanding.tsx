import { BookOutlined, CalendarOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Alert, Card, Col, Row, Space, Typography } from "antd";
import { useLocation } from "react-router-dom";

import ButtonLink from "../common/ButtonLink";

const { Title, Paragraph } = Typography;

const features = [
  {
    icon: <UnorderedListOutlined />,
    title: "Follow your series",
    text: "Search for any comic series and add it to a pull list. Group them however you like.",
  },
  {
    icon: <CalendarOutlined />,
    title: "See each week's releases",
    text: "New comics come out on Wednesdays. See which issues from your series are out this week, or any week.",
  },
  {
    icon: <BookOutlined />,
    title: "Keep track of what you've read",
    text: "Mark issues read as you go, and get a list of everything you still haven't read.",
  },
];

export default function PageLanding() {
  const accountDeleted = new URLSearchParams(useLocation().search).has("account-deleted");
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 0" }}>
      {accountDeleted && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 32 }}
          title="Your account has been deleted."
          description="Thanks for using WeeklyPulls."
        />
      )}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Title style={{ fontSize: 40, marginBottom: 12 }}>Your comics pull list, every week</Title>
        <Paragraph type="secondary" style={{ fontSize: 18, maxWidth: 560, margin: "0 auto 24px" }}>
          WeeklyPulls keeps track of the comic series you read, what&apos;s coming out each week,
          and which issues you haven&apos;t gotten to yet. Free, with no ads.
        </Paragraph>
        <Space size="middle">
          <ButtonLink to="/register" type="primary" size="large">
            Create a free account
          </ButtonLink>
          <ButtonLink to="/login" size="large">
            Log in
          </ButtonLink>
        </Space>
      </div>
      <Row gutter={[24, 24]}>
        {features.map((f) => (
          <Col xs={24} md={8} key={f.title}>
            <Card style={{ height: "100%" }}>
              <div style={{ fontSize: 28, color: "#52c41a", marginBottom: 8 }}>{f.icon}</div>
              <Title level={4}>{f.title}</Title>
              <Paragraph style={{ marginBottom: 0 }}>{f.text}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
