'use client';

import { Trophy, Target, Users, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <span className="font-bold text-4xl text-gray-900">NicheNext</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ニッチ市場のビジネスアイデアを<br />発見・共有するプラットフォーム
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            NicheNextは、革新的なニッチビジネスモデルを発見し、
            アイデアを共有し、次世代の起業家をインスパイアする場所です。
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">ミッション</h3>
            <p className="text-gray-600">
              隠れたニッチ市場の可能性を発見し、
              革新的なビジネスアイデアを世界中の起業家と共有する
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">コミュニティ</h3>
            <p className="text-gray-600">
              起業家、イノベーター、ビジネスに情熱を持つ人々が集まり、
              アイデアを交換し、お互いを高め合う
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">イノベーション</h3>
            <p className="text-gray-600">
              従来の枠にとらわれない新しいビジネスモデルを探求し、
              未来のビジネストレンドを創造する
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">使い方</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">発見する</h3>
              <p className="text-gray-600">
                カテゴリーやトレンドから興味のあるニッチビジネスモデルを探索
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">共有する</h3>
              <p className="text-gray-600">
                あなたのユニークなビジネスアイデアを投稿してコミュニティと共有
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">つながる</h3>
              <p className="text-gray-600">
                コメントやフォローで他の起業家とつながり、アイデアを発展させる
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            今すぐ始めよう
          </h2>
          <p className="text-lg mb-8 opacity-90">
            あなたのニッチビジネスアイデアが、次の大きなトレンドになるかもしれません
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              ビジネスモデルを探す
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
