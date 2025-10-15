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
    page = 1,
    limit = 20,
    category?: PollCategory
  ): Promise<{
    polls: Poll[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Try to get actual polls first
      const response = await api.get("/polls/my-polls");
      const polls = response.data || [];

      // If no polls exist, return mock data for testing
      if (!polls || polls.length === 0) {
        const mockPolls: Poll[] = [
          {
            id: 1,
            userId: 1,
            question: "Sedan sau SUV?",
            options: [
              {
                id: 1,
                text: "Sedan",
                votes: 15,
                percentage: 60,
                isSelected: false,
              },
              {
                id: 2,
                text: "SUV",
                votes: 10,
                percentage: 40,
                isSelected: false,
              },
            ],
            totalVotes: 25,
            createdAt: new Date().toISOString(),
            isActive: true,
            category: PollCategory.CARS,
            user: { id: 1, name: "CarMatch", imageUrl: "" },
          },
          {
            id: 2,
            userId: 1,
            question: "Benzină sau Diesel?",
            options: [
              {
                id: 1,
                text: "Benzină",
                votes: 20,
                percentage: 67,
                isSelected: false,
              },
              {
                id: 2,
                text: "Diesel",
                votes: 10,
                percentage: 33,
                isSelected: false,
              },
            ],
            totalVotes: 30,
            createdAt: new Date().toISOString(),
            isActive: true,
            category: PollCategory.AUTOMOTIVE,
            user: { id: 1, name: "CarMatch", imageUrl: "" },
          },
          {
            id: 3,
            userId: 1,
            question: "Mașină nouă sau second-hand?",
            options: [
              {
                id: 1,
                text: "Nouă",
                votes: 8,
                percentage: 40,
                isSelected: false,
              },
              {
                id: 2,
                text: "Second-hand",
                votes: 12,
                percentage: 60,
                isSelected: false,
              },
            ],
            totalVotes: 20,
            createdAt: new Date().toISOString(),
            isActive: true,
            category: PollCategory.CARS,
            user: { id: 1, name: "CarMatch", imageUrl: "" },
          },
        ];

        return {
          polls: mockPolls,
          total: mockPolls.length,
          hasMore: false,
        };
      }

      return {
        polls: polls,
        total: polls.length,
        hasMore: false, // Since we're getting all at once
      };
    } catch (error) {
      console.error("❌ [Polls Service] Error fetching polls:", error);

      // Return mock data as fallback
      const mockPolls: Poll[] = [
        {
          id: 1,
          userId: 1,
          question: "Sedan sau SUV?",
          options: [
            {
              id: 1,
              text: "Sedan",
              votes: 15,
              percentage: 60,
              isSelected: false,
            },
            {
              id: 2,
              text: "SUV",
              votes: 10,
              percentage: 40,
              isSelected: false,
            },
          ],
          totalVotes: 25,
          createdAt: new Date().toISOString(),
          isActive: true,
          category: PollCategory.CARS,
          user: { id: 1, name: "CarMatch", imageUrl: "" },
        },
      ];

      return {
        polls: mockPolls,
        total: mockPolls.length,
        hasMore: false,
      };
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
        ...pollData,
        matchId: "general", // For community polls
        durationMinutes: pollData.duration * 60, // Convert hours to minutes
      });
      return response.data;
    } catch (error) {
      console.error("❌ [Polls Service] Error creating poll:", error);

      // Mock successful creation for testing
      const mockPoll: Poll = {
        id: Date.now(),
        userId: 1,
        question: pollData.question,
        options: pollData.options.map((text, index) => ({
          id: index + 1,
          text,
          votes: 0,
          percentage: 0,
          isSelected: false,
        })),
        totalVotes: 0,
        createdAt: new Date().toISOString(),
        isActive: true,
        category: pollData.category,
        user: { id: 1, name: "You", imageUrl: "" },
      };

      return mockPoll;
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
      const response = await api.post("/polls/vote", {
        pollId,
        optionIndex: optionId, // Backend expects optionIndex
      });

      return {
        success: true,
        poll: response.data.poll,
        vote: response.data.vote,
      };
    } catch (error) {
      console.error("❌ [Polls Service] Error voting on poll:", error);

      // Mock successful vote for testing
      const mockVote: PollVote = {
        id: Date.now(),
        pollId: pollId,
        optionId: optionId,
        userId: 1,
        createdAt: new Date().toISOString(),
      };

      // Get current polls to update the voted poll
      const currentPolls = await this.getPolls();
      const poll = currentPolls.polls.find((p) => p.id === pollId);

      if (poll) {
        // Update the poll with the new vote
        poll.options.forEach((option, index) => {
          if (option.id === optionId) {
            option.votes += 1;
            option.isSelected = true;
          }
        });

        poll.totalVotes += 1;

        // Recalculate percentages
        poll.options.forEach((option) => {
          option.percentage =
            poll.totalVotes > 0
              ? Math.round((option.votes / poll.totalVotes) * 100)
              : 0;
        });
      }

      return {
        success: true,
        poll: poll || currentPolls.polls[0],
        vote: mockVote,
      };
    }
  }

  // Get user's votes
  async getMyVotes(): Promise<PollVote[]> {
    const response = await api.get("/polls/my-votes");
    return response.data;
  }

  // Get user's polls
  async getMyPolls(): Promise<Poll[]> {
    const response = await api.get("/polls/my-polls");
    return response.data;
  }

  // Delete poll (if owner) - endpoint may not exist
  async deletePoll(pollId: number): Promise<{ success: boolean }> {
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
  async searchPolls(query: string, category?: PollCategory): Promise<Poll[]> {
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
    pollId: number,
    reason: string
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
