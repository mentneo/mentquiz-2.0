import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();
    
    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
      },
    });
    
    // Return success without exposing sensitive data
    const { hashedPassword: _, ...result } = user;
    
    return NextResponse.json(
      { message: "User created successfully", user: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
