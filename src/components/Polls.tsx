import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaPlus,
  FaVoteYea,
  FaChartBar,
  FaUser,
  FaClock,
  FaCheck,
} from "react-icons/fa";
import { usePolls } from "../hooks/usePolls";
import { PollCategory } from "../types";

interface PollsProps {
  visible: boolean;
  onClose: () => void;
}

interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    question: string,
    options: string[],
    category: PollCategory
  ) => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [category, setCategory] = useState<PollCategory>(PollCategory.GENERAL);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (question.trim() && validOptions.length >= 2) {
      onSubmit(question.trim(), validOptions, category);
      setQuestion("");
      setOptions(["", ""]);
      setCategory(PollCategory.GENERAL);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl"
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Creează Poll</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Întrebare
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Care este întrebarea ta?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PollCategory)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value={PollCategory.GENERAL}>General</option>
              <option value={PollCategory.CARS}>Mașini</option>
              <option value={PollCategory.DATING}>Dating</option>
              <option value={PollCategory.AUTOMOTIVE}>Auto</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opțiuni
            </label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Opțiunea ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  maxLength={100}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}

            {options.length < 6 && (
              <button
                onClick={handleAddOption}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-pink-500 hover:text-pink-500 transition-colors"
              >
                <FaPlus className="inline mr-2" />
                Adaugă opțiune
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Anulează
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !question.trim() ||
                options.filter((opt) => opt.trim()).length < 2
              }
              className="flex-1 py-3 px-4 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Creează
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Polls: React.FC<PollsProps> = ({ visible, onClose }) => {
  const { polls, loading, createPoll, voteOnPoll, hasVotedOnPoll } = usePolls();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [voting, setVoting] = useState<{
    pollId: number;
    optionId: number;
  } | null>(null);

  const handleCreatePoll = async (
    question: string,
    options: string[],
    category: PollCategory
  ) => {
    try {
      await createPoll({
        question,
        options,
        category,
      });
    } catch (error) {
      console.error("Failed to create poll:", error);
    }
  };

  const handleVote = async (pollId: number, optionId: number) => {
    if (voting || hasVotedOnPoll(pollId)) return;

    setVoting({ pollId, optionId });
    try {
      await voteOnPoll(pollId, optionId);
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setVoting(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Acum";
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Poll-uri</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                >
                  <FaPlus />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"
                />
              </div>
            ) : polls.length > 0 ? (
              <div className="space-y-4">
                {polls.map((poll) => {
                  const hasVoted = hasVotedOnPoll(poll.id);

                  return (
                    <motion.div
                      key={poll.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                            <FaUser className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {poll.user.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaClock />
                              <span>{formatTimeAgo(poll.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-medium">
                          {poll.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {poll.question}
                      </h3>

                      <div className="space-y-2">
                        {poll.options.map((option) => {
                          const isVoting =
                            voting?.pollId === poll.id &&
                            voting?.optionId === option.id;
                          const isSelected = option.isSelected;

                          return (
                            <button
                              key={option.id}
                              onClick={() => handleVote(poll.id, option.id)}
                              disabled={hasVoted || isVoting}
                              className={`w-full p-3 rounded-lg text-left transition-all ${
                                hasVoted
                                  ? isSelected
                                    ? "bg-pink-100 border-2 border-pink-500"
                                    : "bg-gray-100"
                                  : "bg-white border-2 border-gray-200 hover:border-pink-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {isVoting ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                      className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full"
                                    />
                                  ) : hasVoted && isSelected ? (
                                    <FaCheck className="text-pink-500" />
                                  ) : (
                                    <FaVoteYea className="text-gray-400" />
                                  )}
                                  <span className="font-medium">
                                    {option.text}
                                  </span>
                                </div>

                                {hasVoted && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">
                                      {option.percentage}%
                                    </span>
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                          width: `${option.percentage}%`,
                                        }}
                                        transition={{
                                          duration: 0.5,
                                          delay: 0.2,
                                        }}
                                        className="h-full bg-pink-500"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaChartBar />
                          <span>{poll.totalVotes} voturi</span>
                        </div>
                        {poll.expiresAt && (
                          <span>
                            Expiră:{" "}
                            {new Date(poll.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaVoteYea className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Nu există poll-uri disponibile.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Creează primul poll
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <CreatePollModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePoll}
      />
    </AnimatePresence>
  );
};

export default Polls;
