import BackButton from './BackButton';

export default function Nav({ title }: { title: string }) {
  return (
    <div className="verticalAlign">
      <nav>
        <div className="container">
          <h3>{title}</h3>
          <BackButton />
        </div>
      </nav>
    </div>
  );
}
