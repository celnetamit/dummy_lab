import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

const allowedOrigins = [
  "http://localhost:5173", // Main Hub
  "http://localhost:5174", // Project 1
  "http://localhost:5175", // Project 2
  "http://localhost:5176"  // Project 3
];

function getCorsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  if (allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }
  return {};
}

export async function OPTIONS(req) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const all = searchParams.get('all'); // Admin flag to get all subs
    
    if (all === 'true') {
      const allSubs = await prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(allSubs, { headers: getCorsHeaders(req) });
    }
    
    if (!username) {
      return NextResponse.json({ error: "username required" }, { status: 400, headers: getCorsHeaders(req) });
    }

    // Admins get global access to all products without a subscription
    if (username === 'admin') {
      return NextResponse.json([
        { productId: 'project_1', status: 'active', verificationToken: 'admin-bypass' },
        { productId: 'project_2', status: 'active', verificationToken: 'admin-bypass' },
        { productId: 'project_3', status: 'active', verificationToken: 'admin-bypass' }
      ], { headers: getCorsHeaders(req) });
    }

    // User gets ALL their subscriptions so they know if it's pending or active
    const subscriptions = await prisma.subscription.findMany({
      where: { username }
    });
    
    return NextResponse.json(subscriptions, { headers: getCorsHeaders(req) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: getCorsHeaders(req) });
  }
}

export async function POST(req) {
  try {
    const { username, productId } = await req.json();
    
    if (!username || !productId) {
      return NextResponse.json({ error: "username and productId required" }, { status: 400, headers: getCorsHeaders(req) });
    }

    // Subscribe sets it to pending
    const sub = await prisma.subscription.upsert({
      where: {
        username_productId: { username, productId }
      },
      update: { status: "pending" },
      create: { username, productId, status: "pending" }
    });

    return NextResponse.json(sub, { status: 201, headers: getCorsHeaders(req) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: getCorsHeaders(req) });
  }
}

export async function PUT(req) {
  try {
    // Admin verify/revoke endpoint
    const { id, status } = await req.json(); // status can be "active" or "revoked"
    
    const verificationToken = status === 'active' ? uuidv4() : null;

    const sub = await prisma.subscription.update({
      where: { id },
      data: { status, verificationToken }
    });

    return NextResponse.json(sub, { headers: getCorsHeaders(req) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: getCorsHeaders(req) });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const productId = searchParams.get('productId');

    await prisma.subscription.delete({
      where: {
        username_productId: { username, productId }
      }
    });

    return NextResponse.json({ success: true }, { headers: getCorsHeaders(req) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: getCorsHeaders(req) });
  }
}
