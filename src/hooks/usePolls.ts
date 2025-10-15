import { useState, useEffect, useCallback } from "react";
import { pollsService, CreatePollData } from "../services/polls";
import { Poll, PollCategory, PollVote } from "../types";

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [myVotes, setMyVotes] = useState<PollVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load polls
  const loadPolls = useCallback(
    async (page = 1, category?: PollCategory, reset = false) => {
      try {
        if (reset) {
          setLoading(true);
          setError(null);
        }

        const result = await pollsService.getPolls(page, 20, category);

        if (reset || page === 1) {
          setPolls(result.polls);
        } else {
          setPolls((prev) => [...prev, ...result.polls]);
        }

        setHasMore(result.hasMore);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load polls");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load more polls
  const loadMorePolls = useCallback(
    async (category?: PollCategory) => {
      if (!hasMore || loading) return;

      await loadPolls(currentPage + 1, category, false);
    },
    [currentPage, hasMore, loading, loadPolls]
  );

  // Load my polls
  const loadMyPolls = useCallback(async () => {
    try {
      const myPollsData = await pollsService.getMyPolls();
      setMyPolls(myPollsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load my polls");
    }
  }, []);

  // Load my votes
  const loadMyVotes = useCallback(async () => {
    try {
      const myVotesData = await pollsService.getMyVotes();
      setMyVotes(myVotesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load my votes");
    }
  }, []);

  // Create poll
  const createPoll = useCallback(async (pollData: CreatePollData) => {
    try {
      setError(null);
      const newPoll = await pollsService.createPoll(pollData);

      // Add to polls list
      setPolls((prev) => [newPoll, ...prev]);
      setMyPolls((prev) => [newPoll, ...prev]);

      return newPoll;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create poll");
      throw err;
    }
  }, []);

  // Vote on poll
  const voteOnPoll = useCallback(async (pollId: number, optionId: number) => {
    try {
      setError(null);
      const result = await pollsService.voteOnPoll(pollId, optionId);

      if (result.success) {
        // Update polls list with new vote counts
        setPolls((prev) =>
          prev.map((poll) => (poll.id === pollId ? result.poll : poll))
        );

        // Add to my votes
        setMyVotes((prev) => [result.vote, ...prev]);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote on poll");
      throw err;
    }
  }, []);

  // Delete poll
  const deletePoll = useCallback(async (pollId: number) => {
    try {
      setError(null);
      const result = await pollsService.deletePoll(pollId);

      if (result.success) {
        // Remove from polls list
        setPolls((prev) => prev.filter((poll) => poll.id !== pollId));
        setMyPolls((prev) => prev.filter((poll) => poll.id !== pollId));
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete poll");
      throw err;
    }
  }, []);

  // Get trending polls
  const getTrendingPolls = useCallback(async () => {
    try {
      return await pollsService.getTrendingPolls();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get trending polls"
      );
      return [];
    }
  }, []);

  // Search polls
  const searchPolls = useCallback(
    async (query: string, category?: PollCategory) => {
      try {
        return await pollsService.searchPolls(query, category);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search polls");
        return [];
      }
    },
    []
  );

  // Report poll
  const reportPoll = useCallback(async (pollId: number, reason: string) => {
    try {
      setError(null);
      return await pollsService.reportPoll(pollId, reason);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report poll");
      throw err;
    }
  }, []);

  // Check if user has voted on poll
  const hasVotedOnPoll = useCallback(
    (pollId: number): boolean => {
      return myVotes.some((vote) => vote.pollId === pollId);
    },
    [myVotes]
  );

  // Get user's vote for a poll
  const getUserVoteForPoll = useCallback(
    (pollId: number): PollVote | undefined => {
      return myVotes.find((vote) => vote.pollId === pollId);
    },
    [myVotes]
  );

  // Refresh all data
  const refresh = useCallback(
    async (category?: PollCategory) => {
      setCurrentPage(1);
      setHasMore(true);
      await Promise.all([
        loadPolls(1, category, true),
        loadMyPolls(),
        loadMyVotes(),
      ]);
    },
    [loadPolls, loadMyPolls, loadMyVotes]
  );

  // Initialize
  useEffect(() => {
    loadPolls(1, undefined, true);
    loadMyPolls();
    loadMyVotes();
  }, [loadPolls, loadMyPolls, loadMyVotes]);

  return {
    polls,
    myPolls,
    myVotes,
    loading,
    error,
    hasMore,
    currentPage,
    loadPolls,
    loadMorePolls,
    createPoll,
    voteOnPoll,
    deletePoll,
    getTrendingPolls,
    searchPolls,
    reportPoll,
    hasVotedOnPoll,
    getUserVoteForPoll,
    refresh,
    clearError: () => setError(null),
  };
};
