// src/components/Contact/Contact.tsx
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

export default function Contact() {
  const form = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    if (!form.current) return;

    emailjs
      .sendForm(
        "service_xl6aphe", // <- înlocuiește cu ID-ul tău
        "template_2xz5ea5", // <- înlocuiește cu ID-ul tău
        form.current,
        "35quxGwGCCZ2jWdRl" // <- înlocuiește cu cheia ta publică
      )
      .then(
        () => {
          setStatus("Mesaj trimis cu succes!");
          form.current?.reset();
          setLoading(false);
        },
        (error) => {
          console.error(error.text);
          setStatus("Eroare la trimitere. Încearcă din nou.");
          setLoading(false);
        }
      );
  };

  return (
    <motion.div
      className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-semibold mb-6 text-center text-black">
        📬 Contactează-ne
      </h2>
      <form
        ref={form}
        onSubmit={sendEmail}
        className="flex flex-col space-y-4 text-black"
      >
        <input
          type="text"
          name="name"
          placeholder="Numele tău"
          required
          className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="email"
          name="email"
          placeholder="Emailul tău"
          required
          className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="text"
          name="subject"
          placeholder="Subiect"
          required
          className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />
        <textarea
          name="message"
          rows={5}
          placeholder="Mesajul tău"
          required
          className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          {loading ? "Se trimite..." : "Trimite"}
        </motion.button>
        {status && (
          <motion.p
            className="text-center text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {status}
          </motion.p>
        )}
      </form>
    </motion.div>
  );
}
