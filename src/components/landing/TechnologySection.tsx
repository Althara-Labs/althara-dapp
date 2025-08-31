import Image from "next/image";


export default function TechnologySection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-600 mb-8 font-medium">Powered by</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
            <Image src="/filecoin-logo.png" alt="Filecoin Logo" width={32} height={32} />
            </div>
            <span className="font-semibold text-gray-900">Filecoin</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image src="/ethereum-eth-logo.png" alt="Ethereum Logo" width={32} height={32} />
            </div>
            <span className="font-semibold text-gray-900">Ethereum</span>
          </div>
        </div>
      </div>
    </section>
  );
}
