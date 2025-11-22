import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy";
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, type }) => {
  const termsContent = {
    terms: {
      title: "Terms and Conditions",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content:
            "By accessing and using the Cruizr application, you agree to be bound by these Terms and Conditions. If you do not agree with any of these terms, please do not use the application.",
        },
        {
          title: "2. Eligibility",
          content:
            "You must be at least 18 years old to use Cruizr. By creating an account, you confirm that you are of legal age and that all information provided is accurate and complete.",
        },
        {
          title: "3. Acceptable Behavior",
          content:
            "Users must maintain respectful and civilized behavior. It is strictly prohibited to:",
        },
        {
          title: "",
          content:
            "• Harass, intimidate, or threaten other users\n• Use offensive, racist, sexist, or discriminatory language\n• Share unsolicited explicit sexual content\n• Impersonate others or use false information\n• Spam or send unsolicited commercial messages\n• Use the application for illegal activities",
        },
        {
          title: "4. Content and Photos",
          content:
            "Uploaded photos and content must comply with the following rules:",
        },
        {
          title: "",
          content:
            "• Photos must belong to you or you must have the right to use them\n• Photos with explicit sexual content are not permitted\n• Photos promoting violence or hatred are not permitted\n• Photos must accurately represent you",
        },
        {
          title: "5. Privacy and Safety",
          content:
            "We encourage you not to share sensitive personal information (address, banking details, etc.) with other users until you feel comfortable. In-person meetings should take place in public locations.",
        },
        {
          title: "6. Account Suspension",
          content:
            "We reserve the right to suspend or delete any account that violates these terms, without prior notice. Our decisions in this matter are final.",
        },
        {
          title: "7. Changes to Terms",
          content:
            "We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the new terms.",
        },
        {
          title: "8. Reporting Abuse",
          content:
            "If you encounter inappropriate behavior, please report the user using the reporting function in the application. We take all reports seriously.",
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          title: "1. Information Collected",
          content:
            "We collect the following types of information when you use Cruizr:",
        },
        {
          title: "",
          content:
            "• Profile information (name, age, gender, preferences)\n• Uploaded photos and content\n• Information about your car (make, model, year)\n• Location data (to find nearby users)\n• Interaction history (matches, messages)\n• Application usage data",
        },
        {
          title: "2. How We Use Information",
          content: "We use the collected information to:",
        },
        {
          title: "",
          content:
            "• Create and maintain your profile\n• Suggest compatible matches\n• Improve user experience\n• Prevent fraud and abuse\n• Communicate with you about our services\n• Analyze and improve application functionality",
        },
        {
          title: "3. Information Sharing",
          content:
            "Your profile information is visible to other users according to your privacy settings. We do not sell personal data to third parties. We may share aggregated and anonymized data for analysis purposes.",
        },
        {
          title: "4. Data Security",
          content:
            "We implement technical and organizational security measures to protect your data. However, no method of electronic transmission or storage is 100% secure.",
        },
        {
          title: "5. Your Rights",
          content: "You have the right to:",
        },
        {
          title: "",
          content:
            "• Access and download your personal data\n• Correct inaccurate information\n• Request deletion of account and data\n• Object to data processing for certain purposes\n• Withdraw your consent at any time",
        },
        {
          title: "6. Cookies and Similar Technologies",
          content:
            "We use cookies and similar technologies to improve user experience, analyze traffic, and personalize content.",
        },
        {
          title: "7. Data Retention",
          content:
            "We retain your data as long as the account is active or as necessary to provide services. Data may be retained longer for legal compliance.",
        },
        {
          title: "8. Contact",
          content:
            "For questions about privacy or to exercise your rights, contact us at: privacy@cruizr.app",
        },
      ],
    },
  };

  const content = type === "terms" ? termsContent.terms : termsContent.privacy;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
                <h2 className="text-2xl font-bold pr-10">{content.title}</h2>
                <p className="text-white/90 text-sm mt-2">
                  Last updated: November 22, 2025
                </p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="space-y-6">
                  {content.sections.map((section, index) => (
                    <div key={index}>
                      {section.title && (
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {section.title}
                        </h3>
                      )}
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center">
                    By using the Cruizr application, you confirm that you have read and
                    understood these terms.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;
