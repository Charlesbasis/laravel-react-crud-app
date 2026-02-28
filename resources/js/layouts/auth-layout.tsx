import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function AuthLayout({
    children,
    title,
    description,
    layout = 'split',
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    layout?: 'simple' | 'card' | 'split';
}) {
    const Layout = {
        simple: AuthSimpleLayout,
        card: AuthCardLayout,
        split: AuthSplitLayout,
    }[layout];

    return (
        <Layout title={title} description={description} {...props}>
            {children}
        </Layout>
    );
}
