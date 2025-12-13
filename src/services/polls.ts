import api from "./api";
import { Poll, PollVote, PollCategory } from "../types";

export interface CreatePollData {
  question: string;
  options: string[];
  category: PollCategory;
  duration?: number; // hours - to match what we use in the UI
}

export interface PollStats {
  totalPolls: number;
  totalVotes: number;
  myPolls: number;
  myVotes: number;
}

class PollsService {
  private static instance: PollsService;

  private constructor() {}

  static getInstance(): PollsService {
    if (!PollsService.instance) {
      PollsService.instance = new PollsService();
    }
    return PollsService.instance;
  }

  // Get all polls (using my-polls for now since general endpoint doesn't exist)
  async getPolls(
    _page = 1,
    _limit = 20,
    _category?: PollCategory
  ): Promise<{
    polls: Poll[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Try to get actual polls first
      const response = await api.get("/polls/my-polls");
      const rawPolls = response.data || [];

      // Transform backend data to frontend format
      const polls: Poll[] = rawPolls.map((poll: any) => {
        const totalVotes = poll.votes?.length || 0;
        
        // Calculate votes per option
        const optionVotes = poll.options.map((_: any, index: number) => {
          return poll.votes?.filter((vote: any) => vote.optionIndex === index).length || 0;
        });

        return {
          id: poll.id,
          userId: poll.createdByUserId,
          question: poll.question,
          options: poll.options.map((text: string, index: number) => ({
            id: index + 1,
            text,
            votes: optionVotes[index],
            percentage: totalVotes > 0 ? Math.round((optionVotes[index] / totalVotes) * 100) : 0,
            isSelected: false, // Will be set by the component based on user's votes
          })),
          totalVotes,
          createdAt: poll.createdAt,
          expiresAt: poll.expiresAt,
          isActive: poll.isActive && new Date(poll.expiresAt) > new Date(),
          category: poll.matchId === "general" ? "general" : "cars",
          user: {
            id: poll.createdBy?.id || poll.createdByUserId,
            name: poll.createdBy?.name || "CarMatch",
            imageUrl: poll.createdBy?.imageUrl || "",
          },
        };
      });

      return {
        polls,
        total: polls.length,
        hasMore: false,
      };
    } catch (error) {
      console.error("❌ [Polls Service] Error fetching polls:", error);

      // Return empty array instead of mock data
      return {
        polls: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  // Get my polls with proper error handling
  async getMyPolls(): Promise<Poll[]> {
    try {
      const result = await this.getPolls();
      return result.polls;
    } catch (error) {
      console.error("❌ [Polls Service] Error fetching my polls:", error);
      return [];
    }
  }

  // Get specific poll (this endpoint may not exist, commenting out for now)
  async getPoll(pollId: number): Promise<Poll> {
    // This endpoint doesn't seem to exist in the backend
    // const response = await api.get(`/polls/${pollId}`);
    // return response.data;

    // For now, we'll get from my-polls and find the specific one
    const myPolls = await this.getMyPolls();
    const poll = myPolls.find((p) => p.id === pollId);
    if (!poll) {
      throw new Error(`Poll with ID ${pollId} not found`);
    }
    return poll;
  }

  // Create new poll
  async createPoll(pollData: CreatePollData): Promise<Poll> {
    try {
      const response = await api.post("/polls/create", {
        question: pollData.question,
        options: pollData.options,
        matchId: "general", // For community polls
        durationMinutes: (pollData.duration || 24) * 60, // Convert hours to minutes
        allowMultipleChoices: false,
      });

      const rawPoll = response.data;
      const totalVotes = rawPoll.votes?.length || 0;

      // Transform backend response to frontend format
      const poll: Poll = {
        id: rawPoll.id,
        userId: rawPoll.createdByUserId,
        question: rawPoll.question,
        options: rawPoll.options.map((text: string, index: number) => ({
          id: index + 1,
          text,
          votes: 0,
          percentage: 0,
          isSelected: false,
        })),
        totalVotes,
        createdAt: rawPoll.createdAt,
        expiresAt: rawPoll.expiresAt,
        isActive: rawPoll.isActive,
        category: pollData.category,
        user: {
          id: rawPoll.createdBy?.id || rawPoll.createdByUserId,
          name: rawPoll.createdBy?.name || "You",
          imageUrl: rawPoll.createdBy?.imageUrl || "",
        },
      };

      console.log("✅ [Polls Service] Poll created successfully:", poll);
      return poll;
    } catch (error) {
      console.error("❌ [Polls Service] Error creating poll:", error);
      throw error;
    }
  }

  // Vote on poll
  async voteOnPoll(
    pollId: number,
    optionId: number
  ): Promise<{
    success: boolean;
    poll: Poll;
    vote: PollVote;
  }> {
    try {
      // Backend expects 0-indexed optionIndex, frontend uses 1-indexed optionId
      const response = await api.post("/polls/vote", {
        pollId,
        optionIndex: optionId - 1, // Convert to 0-indexed for backend
      });

      const rawPoll = response.data;
      const totalVotes = rawPoll.votes?.length || 0;
      
      // Calculate votes per option
      const optionVotes = rawPoll.options.map((_: any, index: number) => {
        return rawPoll.votes?.filter((vote: any) => vote.optionIndex === index).length || 0;
      });

      // Transform poll data
      const poll: Poll = {
        id: rawPoll.id,
        userId: rawPoll.createdByUserId,
        question: rawPoll.question,
        options: rawPoll.options.map((text: string, index: number) => ({
          id: index + 1,
          text,
          votes: optionVotes[index],
          percentage: totalVotes > 0 ? Math.round((optionVotes[index] / totalVotes) * 100) : 0,
          isSelected: false,
        })),
        totalVotes,
        createdAt: rawPoll.createdAt,
        expiresAt: rawPoll.expiresAt,
        isActive: rawPoll.isActive,
        category: rawPoll.matchId === "general" ? "general" : "cars",
        user: {
          id: rawPoll.createdBy?.id || rawPoll.createdByUserId,
          name: rawPoll.createdBy?.name || "CarMatch",
          imageUrl: rawPoll.createdBy?.imageUrl || "",
        },
      };

      // Find the user's vote from the response
      const userVote = rawPoll.votes?.find((v: any) => v.optionIndex === optionId - 1);
      
      const vote: PollVote = {
        id: userVote?.id || Date.now(),
        pollId: pollId,
        optionId: optionId,
        userId: userVote?.userId || 0,
        createdAt: userVote?.createdAt || new Date().toISOString(),
      };

      console.log("✅ [Polls Service] Vote successful:", { poll, vote });

      return {
        success: true,
        poll,
        vote,
      };
    } catch (error) {
      console.error("❌ [Polls Service] Error voting on poll:", error);
      throw error;
    }
  }

  // Get user's votes
  async getMyVotes(): Promise<PollVote[]> {
    try {
      const response = await api.get("/polls/my-votes");
      const votes = response.data || [];
      
      // Transform backend votes to frontend format
      return votes.map((vote: any) => ({
        id: vote.id,
        pollId: vote.pollId,
        optionId: vote.optionIndex + 1, // Backend uses 0-indexed, frontend uses 1-indexed
        userId: vote.userId,
        createdAt: vote.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("❌ [Polls Service] Error fetching my votes:", error);
      return [];
    }
  }

  // Delete poll (if owner) - endpoint may not exist
  async deletePoll(_pollId: number): Promise<{ success: boolean }> {
    // This endpoint doesn't seem to exist in the backend
    // const response = await api.delete(`/polls/${pollId}`);
    // return response.data;
    throw new Error("Delete poll endpoint not available");
  }

  // Get trending polls - endpoint may not exist
  async getTrendingPolls(): Promise<Poll[]> {
    // This endpoint doesn't seem to exist in the backend
    // const response = await api.get("/polls/trending");
    // return response.data;

    // For now, return my polls as trending
    return await this.getMyPolls();
  }

  // Get poll stats - endpoint may not exist
  async getPollStats(): Promise<PollStats> {
    // This endpoint doesn't seem to exist in the backend
    // const response = await api.get("/polls/stats");
    // return response.data;

    // Return mock stats for now
    const myPolls = await this.getMyPolls();
    const myVotes = await this.getMyVotes();

    return {
      totalPolls: myPolls.length,
      totalVotes: myVotes.length,
      myPolls: myPolls.length,
      myVotes: myVotes.length,
    };
  }

  // Search polls - endpoint may not exist
  async searchPolls(query: string, _category?: PollCategory): Promise<Poll[]> {
    // This endpoint doesn't seem to exist in the backend
    // const params = new URLSearchParams({ q: query });
    // if (category) {
    //   params.append("category", category);
    // }
    // const response = await api.get(`/polls/search?${params.toString()}`);
    // return response.data;

    // For now, search within my polls
    const myPolls = await this.getMyPolls();
    return myPolls.filter((poll) =>
      poll.question.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Report poll - endpoint may not exist
  async reportPoll(
    _pollId: number,
    _reason: string
  ): Promise<{ success: boolean }> {
    // This endpoint doesn't seem to exist in the backend
    // const response = await api.post(`/polls/${pollId}/report`, { reason });
    // return response.data;
    throw new Error("Report poll endpoint not available");
  }

  // Check if user has voted on poll
  hasVotedOnPoll(poll: Poll): boolean {
    return poll.options.some((option) => option.isSelected === true);
  }

  // Calculate poll results
  calculatePollResults(poll: Poll): Poll {
    const totalVotes = poll.options.reduce(
      (sum, option) => sum + option.votes,
      0
    );

    return {
      ...poll,
      totalVotes,
      options: poll.options.map((option) => ({
        ...option,
        percentage:
          totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
      })),
    };
  }
}

export const pollsService = PollsService.getInstance();
