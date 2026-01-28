import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Paste from '@/models/Paste';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { content, ttl_seconds, max_views } = body;

        // Validate content
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Content is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Validate ttl_seconds if provided
        if (ttl_seconds !== undefined && ttl_seconds !== null) {
            if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
                return NextResponse.json(
                    { error: 'ttl_seconds must be an integer >= 1' },
                    { status: 400 }
                );
            }
        }

        // Validate max_views if provided
        if (max_views !== undefined && max_views !== null) {
            if (!Number.isInteger(max_views) || max_views < 1) {
                return NextResponse.json(
                    { error: 'max_views must be an integer >= 1' },
                    { status: 400 }
                );
            }
        }

        // Calculate expiresAt if ttl_seconds is provided
        let expiresAt = null;
        if (ttl_seconds) {
            expiresAt = new Date(Date.now() + ttl_seconds * 1000);
        }

        // Create paste
        const paste = await Paste.create({
            content: content.trim(),
            expiresAt,
            maxViews: max_views || null,
            currentViews: 0
        });

        // Build absolute URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const url = `${baseUrl}/p/${paste._id}`;

        return NextResponse.json(
            { id: paste._id.toString(), url },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
