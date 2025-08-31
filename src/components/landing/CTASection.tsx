import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Transform Public Procurement?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join governments and vendors already building a more transparent future with Althara Pacta.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/connect-wallet-government" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started Today
          </Link>
          <Link href="/tenders" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
