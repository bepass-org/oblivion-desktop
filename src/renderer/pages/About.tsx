import Nav from '../components/Nav';
import packageJsonData from '../../../package.json';

export default function About() {
  return (
    <>
      <Nav title="درباره برنامه" />
      version: {packageJsonData.version}
    </>
  );
}
