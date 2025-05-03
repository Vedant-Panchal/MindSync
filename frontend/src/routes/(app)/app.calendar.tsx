import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/app/calendar")({
  component: RouteComponent,
});

// import { useState, useEffect } from "react"
// import { format, parseISO, isSameDay } from "date-fns"
// import { ChevronLeft, ChevronRight } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { useSwipeable } from "@/hooks/use-swipeable"

// // Sample journal data
// const journalEntries = [
//   {
//     id: "1",
//     title: "First day of the new project",
//     date: "2025-05-01",
//     content:
//       "Today I started working on the new project. The team seems great and I'm excited about the challenges ahead. We had our first meeting and discussed the initial requirements. I need to prepare some mockups for tomorrow's follow-up discussion. Overall, I'm feeling optimistic about this new opportunity and looking forward to seeing how it develops over the coming weeks.",
//     tags: ["work", "project", "meeting"],
//   },
//   {
//     id: "2",
//     title: "Weekend hike at Mount Rainier",
//     date: "2025-04-30",
//     content:
//       "Spent the day hiking at Mount Rainier with friends. The weather was perfect - sunny but not too hot. We took the Skyline Trail and the views were absolutely breathtaking. Saw some wildlife including a fox and several marmots. My legs are sore now but it was totally worth it. Need to plan more outdoor activities like this in the future.",
//     tags: ["hiking", "outdoors", "friends"],
//   },
//   {
//     id: "3",
//     title: "Reflections on the quarter",
//     date: "2025-04-28",
//     content:
//       "As Q1 comes to a close, I've been reflecting on my progress toward my annual goals. I'm on track with most of them, but need to put more focus on my health and fitness objectives. The work-life balance has been challenging with the new project, but I'm determined to make adjustments in Q2. Planning to schedule dedicated time for exercise and meal prep.",
//     tags: ["reflection", "goals", "planning"],
//   },
//   {
//     id: "4",
//     title: "Cooking experiment",
//     date: "2025-04-25",
//     content:
//       "Tried that new recipe I found online for Thai curry. It turned out surprisingly well for a first attempt! I substituted coconut cream for coconut milk which made it richer. Next time I'll add more vegetables and maybe some tofu. Sarah came over and we enjoyed it with a bottle of white wine. Must remember to write down the modifications I made to the recipe.",
//     tags: ["cooking", "food", "experiment"],
//   },
//   {
//     id: "5",
//     title: "Book club discussion",
//     date: "2025-04-22",
//     content:
//       "Had our monthly book club meeting tonight. We discussed 'The Midnight Library' by Matt Haig. Most people enjoyed it, though there were some interesting critiques about the pacing in the middle section. I found the philosophical aspects particularly engaging. Next month we're reading 'Klara and the Sun' which I've been meaning to pick up anyway.",
//     tags: ["books", "club", "discussion"],
//   },
// ]

// // Sort entries by date (newest first)
// const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

// function RouteComponent() {
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(parseISO(sortedEntries[0].date))
//   const [currentEntryIndex, setCurrentEntryIndex] = useState(0)

//   // Find dates that have journal entries
//   const journalDates = journalEntries.map((entry) => parseISO(entry.date))

//   // Update the selected date when the current entry changes
//   useEffect(() => {
//     if (sortedEntries[currentEntryIndex]) {
//       setSelectedDate(parseISO(sortedEntries[currentEntryIndex].date))
//     }
//   }, [currentEntryIndex])

//   // Handle date selection from calendar
//   const handleSelect = (date: Date | undefined) => {
//     if (date) {
//       setSelectedDate(date)

//       // Find the entry that matches the selected date
//       const entryIndex = sortedEntries.findIndex((entry) => isSameDay(parseISO(entry.date), date))

//       if (entryIndex !== -1) {
//         setCurrentEntryIndex(entryIndex)
//       }
//     }
//   }

//   // Navigate to previous journal entry
//   const handlePrevious = () => {
//     if (currentEntryIndex < sortedEntries.length - 1) {
//       setCurrentEntryIndex(currentEntryIndex + 1)
//     }
//   }

//   // Navigate to next journal entry
//   const handleNext = () => {
//     if (currentEntryIndex > 0) {
//       setCurrentEntryIndex(currentEntryIndex - 1)
//     }
//   }

//   // Set up swipe handlers
//   const swipeHandlers = useSwipeable({
//     onSwipedLeft: handleNext,
//     onSwipedRight: handlePrevious,
//   })

//   // Get the current journal entry
//   const currentEntry = sortedEntries[currentEntryIndex]

//   // Function to check if a date has a journal entry
//   const hasJournalEntry = (date: Date) => {
//     return journalDates.some((journalDate) => isSameDay(journalDate, date))
//   }

//   return (
//     <div className="container mx-auto py-6 max-w-4xl">
//       <h1 className="text-2xl font-bold mb-6">Journal Calendar</h1>

//       <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
//         <Card className="border shadow-sm">
//           <CardHeader>
//             <CardTitle>Calendar</CardTitle>
//             <CardDescription>Select a date to view your journal</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Calendar
//               mode="single"
//               selected={selectedDate}
//               onSelect={handleSelect}
//               className="rounded-md border"
//               modifiers={{
//                 hasJournal: (date) => hasJournalEntry(date),
//               }}
//               modifiersStyles={{
//                 hasJournal: {
//                   fontWeight: "bold",
//                   backgroundColor: "rgba(59, 130, 246, 0.1)",
//                   color: "#3b82f6",
//                 },
//               }}
//             />
//           </CardContent>
//         </Card>

//         <div {...swipeHandlers} className="touch-pan-y">
//           <Card className="border shadow-sm h-full flex flex-col">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>{currentEntry.title}</CardTitle>
//                   <CardDescription>{format(parseISO(currentEntry.date), "EEEE, MMMM d, yyyy")}</CardDescription>
//                 </div>
//                 <div className="flex space-x-1">
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={handlePrevious}
//                     disabled={currentEntryIndex >= sortedEntries.length - 1}
//                   >
//                     <ChevronLeft className="h-4 w-4" />
//                     <span className="sr-only">Previous</span>
//                   </Button>
//                   <Button variant="outline" size="icon" onClick={handleNext} disabled={currentEntryIndex <= 0}>
//                     <ChevronRight className="h-4 w-4" />
//                     <span className="sr-only">Next</span>
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="flex-grow">
//               <div className="prose prose-sm max-w-none">
//                 <p className="line-clamp-[12]">{currentEntry.content}</p>
//               </div>
//             </CardContent>
//             <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
//               {currentEntry.tags.map((tag) => (
//                 <span
//                   key={tag}
//                   className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
//                 >
//                   {tag}
//                 </span>
//               ))}
//             </CardFooter>
//           </Card>
//         </div>
//       </div>

//       <div className="mt-4 text-center text-sm text-muted-foreground md:hidden">
//         Swipe left or right to navigate between journal entries
//       </div>
//     </div>
//   )
// }

import { DatePickerWithRange } from "@/components/ui/calender-component";

// Sample journal data structure based on the backend response

function RouteComponent() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mb-3">
        <DatePickerWithRange />
      </div>
    </div>
  );
}
