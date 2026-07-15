import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const data = await prisma.dataRecord.findUnique({
      where: { id: params.id }
    });
    if (!data) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { title, content } = await req.json();
    const updatedData = await prisma.dataRecord.update({
      where: { id: params.id },
      data: { title, content }
    });
    return NextResponse.json(updatedData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.dataRecord.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
