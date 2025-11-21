<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {        
        // dd([
        //     'content-type' => $this->header('content-type'),
        //     'image_input' => $this->input('image'),
        //     'image_file' => $this->file('image'),
        // ]);
        
        return [
            "name" => "required|string|max:255",
            "description" => "required|string|max:1000",
            "image" => $this->isMethod('POST')
                ? "required|image|mimes:jpg,png,jpeg,svg|max:2048"
                : "nullable|image|mimes:jpg,png,jpeg,svg|max:2048",
            "price" => "required|numeric|min:0",
            "tags" => "nullable|string",
            "tags.*" => "string|distinct|max:50",
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            "name.required" => "Name is required",
            "name.string" => "Name must be a string",
            "name.max" => "Name must be at most 255 characters",
            "description.required" => "Description is required",
            "description.string" => "Description must be a string",
            "description.max" => "Description must be at most 1000 characters",
            "image.image" => "Image must be an image",
            "image.mimes" => "Image must be a JPEG, PNG, JPG, or SVG file",
            "image.max" => "Image must be at most 2048 kilobytes",
            "price.required" => "Price is required",
            "price.numeric" => "Price must be a number",
            "price.min" => "Price must be at least 0",
        ];
    }
}
