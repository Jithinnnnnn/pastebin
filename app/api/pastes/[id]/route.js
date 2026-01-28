import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Paste from '@/models/Paste';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;

        // Step 1: Find paste by ID
        const paste = await Paste.findById(id);
        if (!paste) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Step 2: Determine "Now" - Check TEST_MODE and x-test-now-ms header
        let now;
        if (process.env.TEST_MODE === '1') {
            const testNowMs = request.headers.get('x-test-now-ms');
            if (testNowMs) {
                now = parseInt(testNowMs, 10);
            } else {
                now = Date.now();
            }
        } else {
            now = Date.now();
        }

        // Step 3: Expiry Check - If expiresAt is set and expiresAt < Now -> 404
        if (paste.expiresAt && paste.expiresAt.getTime() < now) {
            return NextResponse.json(
                { error: 'Paste has expired' },
                { status: 404 }
            );
        }

        // Step 4: View Limit Check - If maxViews is set and currentViews >= maxViews -> 404
        // IMPORTANT: This check happens BEFORE incrementing
        if (paste.maxViews !== null && paste.currentViews >= paste.maxViews) {
            return NextResponse.json(
                { error: 'Paste view limit exceeded' },
                { status: 404 }
            );
        }

        // Step 5: Increment currentViews and save
        paste.currentViews += 1;
        await paste.save();

        // Step 6: Calculate remaining_views (after increment)
        let remaining_views = null;
        if (paste.maxViews !== null) {
            remaining_views = paste.maxViews - paste.currentViews;
        }

        // Format expires_at as ISO string or null
        const expires_at = paste.expiresAt ? paste.expiresAt.toISOString() : null;

        return NextResponse.json(
            {
                content: paste.content,
                remaining_views,
                expires_at
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching paste:', error);

        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Terminate/Delete a paste
export async function DELETE(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;

        // Find and delete the paste
        const paste = await Paste.findByIdAndDelete(id);

        if (!paste) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Paste terminated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting paste:', error);

        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
