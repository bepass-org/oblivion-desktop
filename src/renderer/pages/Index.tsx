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
    <>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Container className=" d-flex justify-content-center flex-column align-items-center mt-10 gap-4 text-center">
        <Row>
          <h1>OBLIVION</h1>
        </Row>
        <Row>
          <h5>بر پایه وارپ</h5>
        </Row>
        <Row>
          <Form>
            <Form.Check
              className="display-6"
              checked={isConnected && !isLoading}
              onChange={onChange}
              disabled={isLoading}
              type="switch"
              id="custom-switch"
            />
          </Form>
        </Row>
        <Row>{status}</Row>
      </Container>
    </>
  );
}
