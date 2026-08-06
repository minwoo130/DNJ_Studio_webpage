import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PolicyLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-md px-4 py-12">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        <div className="rich-content mt-8 text-sm text-gray-700">{children}</div>
      </section>
      <Footer />
    </main>
  );
}
