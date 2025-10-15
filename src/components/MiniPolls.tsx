import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaPlus,
  FaVoteYea,
  FaChartBar,
  FaUser,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import { usePolls } from "../hooks/usePolls";

interface MiniPollsProps {
  visible: boolean;
  onClose: () => void;
}

const MiniPolls: React.FC<MiniPollsProps> = ({ visible, onClose }) => {
  const { polls, loading } = usePolls();

  const goToFullPolls = () => {
    onClose();
    // Navigate to polls section (assuming there's a polls route)
    console.log("Navigate to full polls");
  };

  // Get recent polls (max 3)
  const getRecentPolls = () => {
    if (!polls || polls.length === 0) return [];
    return polls.slice(0, 3);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const pollDate = new Date(date);
    const diffInHours = Math.floor(
      (now.getTime() - pollDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (!visible) return null;

  const recentPolls = getRecentPolls();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Community Polls</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Latest polls from the community
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaVoteYea className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Active Polls</p>
                <p className="font-bold text-lg text-gray-800">
                  {polls?.length || 0}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaChartBar className="text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Your Votes</p>
                <p className="font-bold text-lg text-gray-800">0</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaUser className="text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-bold text-lg text-gray-800">0</p>
              </div>
            </div>
          </div>

          {/* Recent Polls */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Recent Polls
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentPolls.length > 0 ? (
              <div className="space-y-4 mb-6">
                {recentPolls.map((poll, index) => (
                  <motion.div
                    key={poll.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 line-clamp-2">
                        {poll.question}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500 ml-4">
                        <FaClock className="mr-1" />
                        {formatTimeAgo(poll.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{poll.options?.length || 0} options</span>
                      <span>{poll.totalVotes || 0} votes</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaVoteYea className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No polls available</p>
              </div>
            )}

            {/* Create Poll & View All Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Handle create poll
                  console.log("Create new poll");
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <FaPlus />
                <span>Create New Poll</span>
              </button>

              <button
                onClick={goToFullPolls}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 group"
              >
                <span>View All Polls</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniPolls;
