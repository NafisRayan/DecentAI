// src/pages/HelpPage.js
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FiChevronDown, FiChevronUp, FiMessageCircle, FiBook, FiMail } from 'react-icons/fi';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700">
      <button
        className="w-full py-4 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-white font-medium">{question}</span>
        {isOpen ? (
          <FiChevronUp className="text-gray-400 w-5 h-5" />
        ) : (
          <FiChevronDown className="text-gray-400 w-5 h-5" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-300">
          {answer}
        </div>
      )}
    </div>
  );
};

const ResourceCard = ({ icon: Icon, title, description, link }) => (
  <a
    href={link}
    className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition-colors"
  >
    <Icon className="w-8 h-8 text-blue-400 mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </a>
);

const HelpPage = () => {
  const faqs = [
    {
      question: "How does the blockchain verification work?",
      answer: "Our blockchain verification system ensures data integrity by creating immutable records of all transactions and analyses. Each operation is logged with a unique hash and timestamp."
    },
    {
      question: "What types of data can I analyze?",
      answer: "You can analyze various types of data including medical records, transaction data, traffic data, and more. Our system supports structured and unstructured data formats."
    },
    {
      question: "How secure is my data?",
      answer: "Your data is encrypted end-to-end and stored securely on the blockchain. Only authorized users with proper credentials can access sensitive information."
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Help Center</h2>
          <p className="text-gray-400">Find answers and support resources</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <ResourceCard
            icon={FiBook}
            title="Documentation"
            description="Detailed guides and API documentation"
            link="/docs"
          />
          <ResourceCard
            icon={FiMessageCircle}
            title="Community Support"
            description="Join our community forum for discussions"
            link="/community"
          />
          <ResourceCard
            icon={FiMail}
            title="Contact Support"
            description="Get help from our support team"
            link="/contact"
          />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Still Need Help?</h3>
          <p className="text-gray-300 mb-4">
            Our support team is available 24/7 to assist you with any questions or concerns.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Contact Support
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default HelpPage;