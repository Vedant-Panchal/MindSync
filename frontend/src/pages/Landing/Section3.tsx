import { motion } from "motion/react";
import {
  MessageCircle,
  BookText,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    name: "AI Writing Assistant",
    description:
      "Get personalized writing prompts and feedback to enhance your journaling experience with our AI-powered assistant.",
    icon: MessageCircle,
  },
  {
    name: "Smart Journal Analysis",
    description:
      "Analyze patterns in your journal entries and receive insights about your thoughts, emotions, and personal growth.",
    icon: BookText,
  },
  {
    name: "Personalized Reflection Prompts",
    description:
      "Leverage AI-powered insights to create custom reflection prompts tailored to your journaling style and goals.",
    icon: BrainCircuit,
  },
  {
    name: "Mood & Growth Tracking",
    description:
      "Track your emotional well-being and personal development with AI-driven analytics and visualization tools.",
    icon: TrendingUp,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const iconVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
  },
  hover: {
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

export default function Section3() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-base/7 font-semibold text-pink-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Journal smarter
          </motion.h2>
          <motion.p
            className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Your AI-Powered Journal Companion, Every Day
          </motion.p>
          <motion.p
            className="mt-6 text-lg/8 text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Enhance your self-reflection with AI-driven journaling insights,
            personalized prompts, and comprehensive mood tracking designed to
            support your personal growth journey
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="relative pl-16"
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <dt className="text-base/7 font-semibold text-gray-900">
                  <motion.div
                    className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-pink-600"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <feature.icon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </motion.div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">
                  {feature.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  );
}
