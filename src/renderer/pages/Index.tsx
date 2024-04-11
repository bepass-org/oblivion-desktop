import { useState } from 'react';
import { Container, Form, Row } from 'react-bootstrap';

export default function Index() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e: any) => {
    if (isConnected) {
      setIsConnected(false);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsConnected(true);
      }, 500);
    }
  };

  const status = isLoading
    ? 'در حال اتصال...'
    : isConnected
    ? 'اتصال برقرار شد'
    : 'متصل نیستید';

  return (
    <Container>
      <Row>
        <h1>OBLIVION</h1>
      </Row>
      <Row>
        <p>بر پایه وارپ</p>
      </Row>
      <Row>
        <Form>
          <Form.Check
            checked={isConnected && !isLoading}
            onChange={onChange}
            type="switch"
            id="custom-switch"
          />
        </Form>
      </Row>
      <Row>{status}</Row>
    </Container>
  );
}
