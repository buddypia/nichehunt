export function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          ニッチな
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            ビジネスモデル
          </span>
          を発見しよう
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
          革新的なアイデアと実証済みのビジネスモデルを共有し、
          次の成功への道筋を見つけましょう
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">247+</div>
            <div className="text-blue-100">ビジネスモデル</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">1.2k+</div>
            <div className="text-blue-100">アクティブユーザー</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">89%</div>
            <div className="text-blue-100">成功率</div>
          </div>
        </div>
      </div>
    </section>
  );
}
