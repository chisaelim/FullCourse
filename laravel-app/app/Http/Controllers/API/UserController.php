<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\CreateUserRequest;
use App\Http\Requests\User\DeleteUserRequest;
use App\Http\Requests\User\GetUsersRequest;
use App\Http\Requests\User\ReadUserRequest;
use App\Http\Requests\User\ToggleUserStatusRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\User\UserResource;
use DB;
use Exception;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function getUsers(GetUsersRequest $request)
    {
        $keyword = $request->input('keyword', '');
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        $users = User::isUser()
            ->when($keyword, function ($query) use ($keyword) {
                $query->where('name', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%");
            })
            ->paginate($perPage, ['*'], 'page', $page);

        return response([
            'users' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ], 200);
    }

    public function readUser(ReadUserRequest $request)
    {
        $user = User::where('id', $request->route('id'))
            ->isUser()
            ->firstOrFail();
        return response([
            'user' => new UserResource($user)
        ], 200);
    }

    public function createUser(CreateUserRequest $request)
    {
        try {
            DB::beginTransaction();
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'level' => 'USER',
            ]);
            $user->markEmailAsVerified();
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response([
                'message' => 'Failed to create user'
            ], 500);
        }

        return response([
            'message' => 'User created.',
            'user' => new UserResource($user)
        ], 201);
    }

    public function updateUser(UpdateUserRequest $request)
    {
        $user = User::where('id', $request->route('id'))
            ->isUser()
            ->firstOrFail();

        try {
            DB::beginTransaction();
            $user->name = $request->name;
            $user->email = $request->email;
            if ($request->filled('password')) {
                $user->password = $request->password;
                $user->tokens()->delete(); // Invalidate all tokens of the user after update
            }
            $user->save();
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response([
                'message' => 'Failed to update user'
            ], 500);
        }

        return response([
            'message' => 'User updated.',
            'user' => new UserResource($user)
        ], 200);
    }

    public function deleteUser(DeleteUserRequest $request)
    {
        $user = User::where('id', $request->route('id'))
            ->isUser()
            ->firstOrFail();

        try {
            DB::beginTransaction();
            $user->tokens()->delete(); // Invalidate all tokens before deletion
            $user->delete();
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response([
                'message' => 'Failed to delete user'
            ], 500);
        }

        return response([
            'message' => 'User deleted.'
        ], 200);
    }

    public function toggleUserStatus(ToggleUserStatusRequest $request)
    {
        $user = User::where('id', $request->route('id'))
            ->isUser()
            ->firstOrFail();

        try {
            DB::beginTransaction();
            $user->status = $user->status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
            $user->save();
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response([
                'message' => 'Failed to toggle user status'
            ], 500);
        }

        return response([
            'message' => 'User status toggled.',
            'user' => new UserResource($user)
        ], 200);
    }
}
