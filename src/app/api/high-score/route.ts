import { NextRequest, NextResponse } from 'next/server';
import Redis from 'redis';

// Redis connection
const redis = Redis.createClient({
  url: "redis://default:MHi9uOoLrTdexb9OTzjWZAVntBkwxz50@redis-19901.c241.us-east-1-4.ec2.cloud.redislabs.com:19901"
});

// Connect to Redis
async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

// GET - Retrieve global high score
export async function GET() {
  try {
    await connectRedis();
    
    const highScore = await redis.get('snakeGameGlobalHighScore');
    
    return NextResponse.json({ 
      highScore: highScore ? parseInt(highScore, 10) : 0 
    });
  } catch (error) {
    console.error('Error fetching high score:', error);
    return NextResponse.json({ highScore: 0 }, { status: 500 });
  }
}

// POST - Update global high score
export async function POST(request: NextRequest) {
  try {
    await connectRedis();
    
    const { score } = await request.json();
    
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }
    
    const currentHighScore = await redis.get('snakeGameGlobalHighScore');
    const currentScore = currentHighScore ? parseInt(currentHighScore, 10) : 0;
    
    if (score > currentScore) {
      await redis.set('snakeGameGlobalHighScore', score.toString());
      return NextResponse.json({ 
        highScore: score, 
        isNewRecord: true 
      });
    }
    
    return NextResponse.json({ 
      highScore: currentScore, 
      isNewRecord: false 
    });
  } catch (error) {
    console.error('Error updating high score:', error);
    return NextResponse.json({ error: 'Failed to update high score' }, { status: 500 });
  }
}
