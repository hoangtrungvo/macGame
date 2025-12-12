import { Card, CardType } from '@/types';
import fs from 'fs';
import path from 'path';

// Load questions from JSON file
function loadQuestions(): Record<CardType, Array<{ question: string; answer: string; options?: string[] }>> {
  try {
    const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
    const fileContent = fs.readFileSync(questionsPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading questions.json:', error);
    // Fallback to default questions if file doesn't exist
    return {
      defense: [{ question: 'Thủ đô của Việt Nam là gì?', answer: 'Hà Nội', options: ['Hà Nội', 'Sài Gòn', 'Đà Nẵng', 'Huế'] }],
      heal: [{ question: 'Con vật nào sống được lâu nhất?', answer: 'Rùa', options: ['Rùa', 'Voi', 'Mèo', 'Chó'] }],
      attack: [{ question: 'Kim loại nào nặng nhất?', answer: 'Vàng', options: ['Vàng', 'Sắt', 'Đồng', 'Bạc'] }],
      thunder: [{ question: 'Ai phát minh ra bóng đèn?', answer: 'Edison', options: ['Edison', 'Einstein', 'Newton', 'Tesla'] }],
      detox: [{ question: 'Loại nước nào tốt nhất cho sức khỏe?', answer: 'Nước lọc', options: ['Nước lọc', 'Nước ngọt', 'Nước ép', 'Nước tăng lực'] }],
    };
  }
}

// Card definitions based on the game design
export const CARD_DEFINITIONS: Record<CardType, Omit<Card, 'id'>> = {
  defense: {
    type: 'defense',
    name: 'Phòng Thủ',
    value: 10,
    description: 'Tăng 10 HP',
    color: 'bg-blue-500',
    icon: '🛡️',
    question: '', // Will be randomly assigned
    correctAnswer: '',
  },
  heal: {
    type: 'heal',
    name: 'Hồi Máu',
    value: 15,
    description: 'Hồi 15 HP',
    color: 'bg-green-500',
    icon: '💚',
    question: '',
    correctAnswer: '',
  },
  attack: {
    type: 'attack',
    name: 'Chém Mạnh',
    value: -20,
    description: 'Gây 20 sát thương',
    color: 'bg-orange-500',
    icon: '🔥',
    question: '',
    correctAnswer: '',
  },
  thunder: {
    type: 'thunder',
    name: 'Siêu Phép',
    value: -25,
    description: 'Gây 25 sát thương',
    color: 'bg-purple-500',
    icon: '⚡',
    question: '',
    correctAnswer: '',
  },
  detox: {
    type: 'detox',
    name: 'Giải Độc',
    value: 18,
    description: 'Giải độc và hồi 18 HP',
    color: 'bg-cyan-500',
    icon: '💧',
    question: '',
    correctAnswer: '',
  },
};

// Generate a random card with question
export function generateCard(cardType?: CardType): Card {
  const QUESTIONS_BY_TYPE = loadQuestions();
  
  const types: CardType[] = ['defense', 'heal', 'attack', 'thunder', 'detox'];
  const selectedType = cardType || types[Math.floor(Math.random() * types.length)];
  
  // Get random question for this card type
  const questions = QUESTIONS_BY_TYPE[selectedType];
  if (!questions || questions.length === 0) {
    throw new Error(`No questions available for card type: ${selectedType}`);
  }
  
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    ...CARD_DEFINITIONS[selectedType],
    question: randomQuestion.question,
    correctAnswer: randomQuestion.answer,
    options: randomQuestion.options,
  };
}

// Generate a hand of cards
export function generateCardHand(count: number): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < count; i++) {
    cards.push(generateCard());
  }
  return cards;
}

// Apply card effect to a player
export function applyCardEffect(
  currentHealth: number,
  maxHealth: number,
  card: Card
): { newHealth: number; effectDescription: string } {
  let newHealth = currentHealth + card.value;
  
  // Ensure health stays within bounds
  newHealth = Math.max(0, Math.min(maxHealth, newHealth));
  
  const effectDescription = card.value > 0
    ? `${card.name}: +${card.value} HP (${currentHealth} → ${newHealth})`
    : `${card.name}: ${card.value} HP (${currentHealth} → ${newHealth})`;
  
  return { newHealth, effectDescription };
}

// Calculate score based on game outcome
export function calculateScore(
  won: boolean,
  remainingHealth: number,
  cardsUsed: number,
  gameDuration: number // in milliseconds
): number {
  let score = 0;
  
  if (won) {
    score += 100; // Base win score
    score += remainingHealth; // Bonus for remaining health
    score += Math.max(0, 50 - cardsUsed * 5); // Bonus for efficiency
    
    // Time bonus (faster wins get more points)
    const minutes = gameDuration / (1000 * 60);
    if (minutes < 2) score += 50;
    else if (minutes < 5) score += 30;
    else if (minutes < 10) score += 10;
  }
  
  return Math.floor(score);
}
