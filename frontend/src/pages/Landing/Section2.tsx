import { motion } from "motion/react";
import { BookText, Brain, SparkleIcon } from "lucide-react";

const features = [
  {
    name: "AI-Powered Insights.",
    description:
      "Get personalized reflections and patterns discovered from your journal entries.",
    icon: Brain,
  },
  {
    name: "Mood Tracking.",
    description:
      "Track your emotional well-being over time with intuitive visualizations and trends.",
    icon: SparkleIcon,
  },
  {
    name: "Seamless Journaling Experience.",
    description:
      "Write without friction with our intelligent editor that helps capture your thoughts effortlessly.",
    icon: BookText,
  },
];

export default function Section2() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <motion.div
            className="lg:pt-4 lg:pr-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="lg:max-w-lg">
              <motion.h2
                className="text-primary text-base/7 font-semibold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Journal Smarter
              </motion.h2>
              <motion.p
                className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Insights That Transform Your Self-Reflection
              </motion.p>
              <motion.p
                className="mt-6 text-lg/8 text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Track your thoughts, emotions, and personal growth—all in one
                place. Our AI-powered journal analyzes your entries to provide
                meaningful insights and help you discover patterns in your
                thinking and behavior.
              </motion.p>
              <motion.dl
                className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    className="relative pl-9"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon
                        aria-hidden="true"
                        className="text-primary absolute top-1 left-1 size-5"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </motion.div>
                ))}
              </motion.dl>
            </div>
          </motion.div>
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            alt="Journal dashboard"
            src="/dashboard.jpeg"
            width={1000}
            height={1800}
            className="mt-20 max-w-none scale-110 rounded-xl object-fill ring-1 shadow-xl ring-gray-400/10 md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  );
}
