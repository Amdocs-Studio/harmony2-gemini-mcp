/**
 * Interactive chat with Harmony 2.0 Master Agent
 * Run: node chat.js
 */

import readline from 'readline';
import { HarmonyAgent } from './src/harmony-agent.js';
import dotenv from 'dotenv';

dotenv.config();

const agent = new HarmonyAgent();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('🤖 Harmony 2.0 Master Agent - Interactive Chat\n');
console.log('Type your questions below. Type "exit" or "quit" to end.\n');

function askQuestion() {
  rl.question('You: ', async (input) => {
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      return;
    }

    if (!input.trim()) {
      askQuestion();
      return;
    }

    try {
      console.log('\n🤔 Thinking...\n');
      const response = await agent.chat(input);
      console.log('Agent:', response);
      console.log('\n');
      askQuestion();
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('\n');
      askQuestion();
    }
  });
}

askQuestion();

