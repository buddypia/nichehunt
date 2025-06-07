import { Target, Users, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getServerTranslations } from '@/lib/i18n/server';

export default async function AboutPage() {
  const t = await getServerTranslations();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="w-16 h-16 flex items-center justify-center">
              <Image 
                src="/logo.png"
                alt="NicheNext Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-4xl text-gray-900">NicheNext</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 whitespace-pre-line">
            {t.about.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-pre-line">
            {t.about.description}
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.about.mission.title}</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {t.about.mission.description}
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.about.community.title}</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {t.about.community.description}
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.about.innovation.title}</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {t.about.innovation.description}
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t.about.howItWorks.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.howItWorks.step1.title}</h3>
              <p className="text-gray-600">
                {t.about.howItWorks.step1.description}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.howItWorks.step2.title}</h3>
              <p className="text-gray-600">
                {t.about.howItWorks.step2.description}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.howItWorks.step3.title}</h3>
              <p className="text-gray-600">
                {t.about.howItWorks.step3.description}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t.about.cta.title}
          </h2>
          <p className="text-lg mb-8 opacity-90">
            {t.about.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t.about.cta.exploreButton}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
