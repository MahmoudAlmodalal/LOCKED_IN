<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * Display a listing of the authenticated user's categories.
     */
    public function index(Request $request)
    {
        // Fetch only the categories that belong to the currently authenticated user.
        $categories = $request->user()->categories()->latest()->get();

        return response()->json($categories);
    }

    /**
     * Store a newly created category in storage for the authenticated user.
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create the category and associate it with the authenticated user
        $category = $request->user()->categories()->create($validatedData);

        return response()->json($category, 201); // 201 Created
    }

    /**
     * Display the specified category, if it belongs to the user.
     */
    public function show(Category $category)
    {
        // Authorization: Ensure the authenticated user owns this category
        if (Auth::id() !== $category->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($category);
    }

    /**
     * Update the specified category in storage, if it belongs to the user.
     */
    public function update(Request $request, Category $category)
    {
        // Authorization: Ensure the authenticated user owns this category
        if (Auth::id() !== $category->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Validate the incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Update the category with the validated data
        $category->update($validatedData);

        return response()->json($category);
    }

    /**
     * Remove the specified category from storage, if it belongs to the user.
     */
    public function destroy(Category $category)
    {
        // Authorization: Ensure the authenticated user owns this category
        if (Auth::id() !== $category->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Note: The migration was set up so that if a category is deleted,
        // associated tasks will have their 'category_id' set to null.
        $category->delete();

        // Return a 204 No Content response, indicating success with no body
        return response()->noContent();
    }
}
