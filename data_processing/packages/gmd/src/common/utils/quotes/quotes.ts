import {arraySchema, InferSchemaType, objectSchema} from '../../domain/schema'
import {
  CleanNonEmptyStringSchema,
  DateType,
  DateTypeSchema,
} from '../../domain/value-objects'
import {sample} from 'lodash'

export type Quote = InferSchemaType<typeof QuoteSchema>
export const QuoteSchema = objectSchema({
  text: CleanNonEmptyStringSchema,
  author: CleanNonEmptyStringSchema,
})

export const ofADay = <T>(
  array: T[],
  date: DateType = DateTypeSchema(new Date()),
): T => array[date.getDate() % array.length]

// These quotes should help people start with a hard task
const motivationalQuotes = arraySchema(QuoteSchema)([
  {
    text: 'Do what you can, with what you have, where you are.',
    author: 'Teddy Roosevelt',
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: 'George Addair',
  },
  {
    text: "A ship is safe in harbor, but that's not what ships are for.",
    author: 'John A. Shedd',
  },
  {
    text: "You miss 100% of the shots you don't take.",
    author: 'Wayne Gretzky',
  },
  {
    text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do, so throw off the bowlines, sail away from safe harbor, catch the trade winds in your sails. Explore, Dream, Discover.",
    author: 'Mark Twain',
  },
  {
    text: 'If there is no struggle, there is no progress.',
    author: 'Frederick Douglass',
  },
  {
    text: "The most common way people give up their power is by thinking they don't have any.",
    author: 'Alice Walker',
  },
  {
    text: "If you're going through hell, keep going",
    author: 'Winston Churchill',
  },
  {
    text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
    author: 'Chinese Proverb',
  },
  {
    text: 'Eighty percent of success is showing up.',
    author: 'Woody Allen',
  },
  {
    text: 'You can never cross the ocean until you have the courage to lose sight of the shore.',
    author: 'Christopher Columbus',
  },
  {
    text: "Believe you can and you're halfway there.",
    author: 'Theodore Roosevelt',
  },
  {
    text: 'Challenges are what make life interesting and overcoming them is what makes life meaningful.',
    author: 'Joshua J. Marine',
  },
  {
    text: 'The person who says it cannot be done should not interrupt the person who is doing it.',
    author: 'Chinese Proverb',
  },
  {
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
  },
  {
    text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    author: 'Steve Jobs',
  },
  {
    text: 'Either you run the day or the day runs you.',
    author: 'Jim Rohn',
  },
  {
    text: 'More is lost by indecision than wrong decision.',
    author: 'Marcus Tullius Cicero',
  },
  {
    text: 'You cannot plow a field by turning it over in your mind. To begin, begin.',
    author: 'Gordon B. Hinckley',
  },
  {
    text: "If you don't like the road you're walking, start paving another one.",
    author: 'Dolly Parton',
  },
  {
    text: 'Some people want it to happen, some wish it would happen, others make it happen.',
    author: 'Michael Jordan',
  },
  {
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
])

// These quotes should help to overcome a failure
const learnFromFailureQuotes = arraySchema(QuoteSchema)([
  {
    text: 'Success is not final; failure is not fatal: It is the courage to continue that counts.',
    author: 'Winston S. Churchill',
  },
  {
    text: 'The road to success and the road to failure are almost exactly the same.',
    author: 'Colin R. Davis',
  },
  {
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: 'Unknown',
  },
  {
    text: "Don't settle for average. Bring your best to the moment. Then, whether it fails or succeeds, at least you know you gave all you had.",
    author: 'Angela Bassett',
  },
  {
    text: 'Failure is simply the opportunity to begin again, this time more intelligently.',
    author: 'Henry Ford',
  },
  {
    text: "It's fine to celebrate success but it is more important to heed the lessons of failure.",
    author: 'Bill Gates',
  },
  {
    text: "We need to accept that we won't always make the right decisions, that we'll screw up royally sometimes – understanding that failure is not the opposite of success, it's part of success.",
    author: 'Ariana Huffington',
  },
  {
    text: 'Never let success get to your head and never let failure get to your heart.',
    author: 'Drake',
  },
  {
    text: 'Every strike brings me closer to the next home run.',
    author: 'Babe Ruth',
  },
  {
    text: 'More is lost by indecision than wrong decision.',
    author: 'Marcus Tullius Cicero',
  },
  {
    text: 'The successful man will profit from his mistakes and try again in a different way.',
    author: 'Dale Carnegie',
  },
])

export const motivationalQuoteOfADay = () => ofADay(motivationalQuotes)
export const randomLearnFromFailureQuote = () =>
  QuoteSchema(sample(learnFromFailureQuotes) as any)
