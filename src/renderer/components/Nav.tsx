import BackButton from './BackButton';

export default function Nav({ title }: { title: string }) {
    return (
        <>
            <nav>
                <div className='container'>
                    <h3>{title}</h3>
                    <BackButton />
                </div>
            </nav>
        </>
    );
}
