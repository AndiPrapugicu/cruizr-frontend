import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaVoteYea, FaPlus, FaUser, FaClock, FaCheck } from "react-icons/fa";
import { usePolls } from "../hooks/usePolls";
import { PollCategory } from "../types";

const Polls: React.FC = () => {
  const {
    polls,
    myVotes,
    loading,
    error,
    createPoll,
    voteOnPoll,
    hasVotedOnPoll,
  } = usePolls();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
    category: PollCategory.GENERAL,
    duration: 24, // hours
  });

  // Debug logging
  console.log("🗳️ [Polls] Debug info:", {
    polls,
    loading,
    error,
    pollsLength: polls?.length || 0,
  });

  // Enhanced debugging for poll structure
  if (polls && polls.length > 0) {
    console.log("🗳️ [Polls] First poll structure:", polls[0]);
    console.log("🗳️ [Polls] First poll options:", polls[0]?.options);
  }

  const handleCreatePoll = async () => {
    try {
      console.log("🗳️ [Polls] Creating poll with data:", newPoll);

      // Validate data before sending
      const pollData = {
        question: newPoll.question.trim(),
        options: newPoll.options.filter((opt) => opt.trim() !== ""),
        category: newPoll.category,
        duration: newPoll.duration,
      };

      if (!pollData.question) {
        console.error("❌ [Polls] Question is required");
        return;
      }

      if (pollData.options.length < 2) {
        console.error("❌ [Polls] At least 2 options are required");
        return;
      }

      console.log("🗳️ [Polls] Sending poll data:", pollData);

      await createPoll(pollData);

      setShowCreateModal(false);
      setNewPoll({
        question: "",
        options: ["", ""],
        category: PollCategory.GENERAL,
        duration: 24,
      });

      console.log("✅ [Polls] Poll created successfully");
    } catch (err) {
      console.error("❌ [Polls] Error creating poll:", err);
      // Don't close modal if there's an error so user can try again
    }
  };

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    }
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaVoteYea className="mr-3 text-blue-500" />
              Community Polls
            </h1>
            <p className="text-gray-600 mt-2">
              Participate in community surveys and create your own questions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
          >
            <FaPlus />
            Create Poll
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Polls</p>
              <p className="text-2xl font-bold text-blue-600">
                {polls?.filter((p) => p.isActive).length || 0}
              </p>
            </div>
            <FaVoteYea className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Your Votes</p>
              <p className="text-2xl font-bold text-green-600">
                {myVotes?.length || 0}
              </p>
            </div>
            <FaCheck className="text-green-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Polls</p>
              <p className="text-2xl font-bold text-purple-600">
                {polls?.length || 0}
              </p>
            </div>
            <FaUser className="text-purple-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Polls Grid */}
      <div className="grid gap-6">
        {polls && polls.length > 0 ? (
          polls.map((poll) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {poll.question}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FaUser />
                      {poll.user?.name || "CarMatch"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {poll.isActive ? "Active" : "Ended"}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {poll.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-xl font-bold text-gray-800">
                    {poll.totalVotes || 0}
                  </p>
                </div>
              </div>

              {/* Poll Options */}
              <div className="space-y-3">
                {poll.options &&
                Array.isArray(poll.options) &&
                poll.options.length > 0 ? (
                  poll.options.map((option, index) => {
                    const userHasVoted = hasVotedOnPoll(poll.id);
                    return (
                      <div key={option.id || index} className="relative">
                        <button
                          onClick={() =>
                            !userHasVoted &&
                            poll.isActive &&
                            voteOnPoll(poll.id, option.id)
                          }
                          disabled={userHasVoted || !poll.isActive}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            userHasVoted
                              ? option.isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-gray-50"
                              : poll.isActive
                              ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                              : "border-gray-200 bg-gray-100 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option.text}</span>
                            <span className="text-sm text-gray-600">
                              {option.percentage}% ({option.votes})
                            </span>
                          </div>
                          {userHasVoted && (
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  option.isSelected
                                    ? "bg-blue-500"
                                    : "bg-gray-400"
                                }`}
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>No options available for this poll</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <FaVoteYea className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No polls available
            </h3>
            <p className="text-gray-500">
              Be the first to create a community poll!
            </p>
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Create New Poll
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Question
                </label>
                <textarea
                  value={newPoll.question}
                  onChange={(e) =>
                    setNewPoll((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  placeholder="What would you like to ask the community?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Options
                </label>
                <div className="space-y-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {newPoll.options.length < 6 && (
                    <button
                      onClick={addOption}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newPoll.category}
                    onChange={(e) =>
                      setNewPoll((prev) => ({
                        ...prev,
                        category: e.target.value as PollCategory,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={PollCategory.GENERAL}>General</option>
                    <option value={PollCategory.CARS}>Cars</option>
                    <option value={PollCategory.DATING}>Dating</option>
                    <option value={PollCategory.AUTOMOTIVE}>Automotive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <select
                    value={newPoll.duration}
                    onChange={(e) =>
                      setNewPoll((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value),
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={6}>6 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>2 days</option>
                    <option value={168}>1 week</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePoll}
                disabled={
                  !newPoll.question.trim() ||
                  newPoll.options.filter((opt) => opt.trim()).length < 2
                }
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Poll
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Polls;
