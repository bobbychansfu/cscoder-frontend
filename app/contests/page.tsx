"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from 'next/link';

// We’ll repurpose your interface to match the DB fields:
// - 'cid' => 'id'
// - 'name' => 'title'
// - 'type' => 'difficulty' (assuming your DB "type" is used for difficulty)
// - 'location' => 'location'
// - 'starts_at' => used to figure out if "startingSoon"
// - 'category' remains a placeholder for now if not in DB
interface Contest {
  id: number;                    // from DB's cid
  title: string;                 // from DB's name
  difficulty: 'Easy' | 'Normal' | 'Hard';  // from DB's "type" if you store difficulty there
  startingSoon: boolean;
  category: string;              // not in DB, placeholder or manual assignment
  location: string;              // from DB's location
}

// Filters are still your custom logic
interface Filters {
  category: string;
  difficulty: string;
  location: string;
}

export default function ContestsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    category: 'All',
    difficulty: 'All',
    location: 'All',
  });
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        // Example: GET /info returns something like:
        // {
        //   contests: [
        //     {
        //       cid: 1,
        //       name: "Contest 1",
        //       type: "Easy",       // or "Normal" or "Hard" if you're storing difficulty
        //       location: "Remote", // or "Burnaby" etc.
        //       starts_at: "2025-01-15T10:00:00Z",
        //       ...
        //     },
        //     ...
        //   ]
        // }
        const response = await fetch('http://localhost:5000/info', {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch contests');
        }

        const data = await response.json();
        // Map the backend data to match your Contest interface
        const fetchedContests: Contest[] = data.contests.map((contest: any) => ({
          id: contest.cid,
          title: contest.name,
          difficulty: mapDifficulty(contest.type),
          // "startingSoon" logic:
          // If starts_at is in the future => it's starting soon
          startingSoon: new Date(contest.starts_at) > new Date(),
          // "category" doesn’t exist in DB, so we manually set or default:
          category: contest.category || 'Algorithms',
          // "location" directly from DB or fallback:
          location: contest.location || 'Remote',
        }));

        setContests(fetchedContests);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false); // Could add a loading animation instead
      }
    };

    fetchContests();
  }, []);

  // We map "type" from DB to "Easy" | "Normal" | "Hard"
  const mapDifficulty = (typeValue: string): 'Easy' | 'Normal' | 'Hard' => {
    switch (typeValue) {
      case 'Easy':
      case 'Normal':
      case 'Hard':
        return typeValue;
      default:
        return 'Normal';
    }
  };

  // Filter logic
  const filteredContests = contests.filter((contest) => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'All' || contest.category === filters.category;
    const matchesDifficulty = filters.difficulty === 'All' || contest.difficulty === filters.difficulty;
    const matchesLocation = filters.location === 'All' || contest.location === filters.location;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesLocation;
  });

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;
  }

  return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 bg-white p-4 rounded-lg shadow-neumorphic">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Filters</h2>
            <div className="space-y-4">
              <FilterSection
                  title="Category"
                  options={['All', 'Algorithms', 'Dynamic Programming', 'Data Structures']}
                  currentFilter={filters.category}
                  onFilterChange={(value) => handleFilterChange('category', value)}
              />
              <FilterSection
                  title="Difficulty"
                  options={['All', 'Easy', 'Normal', 'Hard']}
                  currentFilter={filters.difficulty}
                  onFilterChange={(value) => handleFilterChange('difficulty', value)}
              />
              <FilterSection
                  title="Location"
                  options={['All', 'Remote', 'Burnaby', 'Surrey', 'Vancouver']}
                  currentFilter={filters.location}
                  onFilterChange={(value) => handleFilterChange('location', value)}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex gap-4 mb-8">
              <Input
                  className="flex-1 bg-white shadow-neumorphic focus:shadow-neumorphic-inset transition-shadow"
                  placeholder="Search for ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Link href={'/create'}>
                <Button className="bg-white text-red-700 shadow-neumorphic transition-shadow">
                  Create
                </Button>
              </Link>
            </div>

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredContests.map((contest) => (
                    <motion.div
                        key={contest.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        layout
                    >
                      <ContestCard contest={contest} />
                    </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>
  );
}

// Filter Section Reusable
interface FilterSectionProps {
  title: string;
  options: string[];
  currentFilter: string;
  onFilterChange: (value: string) => void;
}

function FilterSection({ title, options, currentFilter, onFilterChange }: FilterSectionProps) {
  return (
      <div>
        <h3 className="font-medium text-red-700">{title}</h3>
        <ul className="mt-2 space-y-2">
          {options.map((option) => (
              <li
                  key={option}
                  className={`cursor-pointer ${
                      currentFilter === option ? 'text-green-600' : 'text-gray-600'
                  }`}
                  onClick={() => onFilterChange(option)}
              >
                {option}
              </li>
          ))}
        </ul>
      </div>
  );
}

// ContestCard
interface ContestCardProps {
  contest: Contest;
}
function ContestCard({ contest }: ContestCardProps) {
  return (
      <Link href={`/contest/${contest.id}`}>
        <Card className="bg-white p-4 rounded-lg shadow-neumorphic hover:shadow-neumorphic-hover transition-shadow cursor-pointer">
          <h3 className="font-semibold text-lg mb-2">{contest.title}</h3>
          <p className={`text-sm ${getDifficultyColor(contest.difficulty)}`}>
            {contest.difficulty}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {contest.startingSoon ? 'Starting: soon...' : 'Starting: later'}
          </p>
        </Card>
      </Link>
  );
}

function getDifficultyColor(difficulty: Contest['difficulty']): string {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-600';
    case 'Normal':
      return 'text-yellow-600';
    case 'Hard':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}
