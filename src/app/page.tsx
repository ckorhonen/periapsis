import { NewtonCannonball } from "@/components/demos/NewtonCannonball";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Periapsis
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            An interactive guide to orbital mechanics. Learn about gravity,
            orbits, delta-v, and more through hands-on visualizations.
          </p>
        </header>

        {/* Introduction */}
        <section className="prose prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            The Art of Falling
          </h2>
          <p className="text-gray-300 leading-relaxed">
            What does it mean to orbit? Intuitively, we might imagine satellites
            floating in space, held up by some force against gravity. But the
            truth is far more elegant:{" "}
            <strong className="text-white">
              orbiting is just falling, forever
            </strong>
            .
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Isaac Newton imagined a cannon atop a very tall mountain. Fire a
            cannonball, and it falls to Earth. Fire it faster, and it travels
            further before landing. But fire it fast enough, and something
            magical happens: the Earth curves away beneath it at exactly the
            same rate the cannonball falls. It never lands. It orbits.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Try it yourself below. Adjust the velocity and watch what happens.
          </p>
        </section>

        {/* Newton's Cannonball Demo */}
        <NewtonCannonball />

        {/* Explanation after demo */}
        <section className="prose prose-invert max-w-none mt-12">
          <h3 className="text-xl font-semibold text-white mb-4">
            What you just discovered
          </h3>
          <p className="text-gray-300 leading-relaxed">
            At about <strong className="text-cyan-400">7.9 km/s</strong>, the
            cannonball achieves a circular orbit. This is the{" "}
            <em>orbital velocity</em> at this altitude. Any slower and it
            crashes. Any faster and the orbit becomes elliptical, stretching
            out on the opposite side.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Push past <strong className="text-yellow-400">11.2 km/s</strong>{" "}
            (escape velocity), and the cannonball leaves Earth entirely on a
            hyperbolic trajectory. It will never return.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            This is the foundation of all orbital mechanics: the relationship
            between velocity, altitude, and the shape of your path through
            space.
          </p>
        </section>

        {/* Coming Soon */}
        <section className="mt-16 p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
          <p className="text-gray-400 text-sm">
            This is just the beginning. Future sections will explore elliptical
            orbits, Kepler&apos;s laws, delta-v budgets, Hohmann transfers,
            gravity assists, Lagrange points, and more.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>Built with curiosity. Inspired by the cosmos.</p>
        </footer>
      </main>
    </div>
  );
}
