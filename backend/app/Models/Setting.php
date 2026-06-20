<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model {
    protected $fillable = ['key', 'value', 'group'];

    public static function getValue($key, $default = null) {
        return Cache::remember('setting_' . $key, 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    public static function setValue($key, $value, $group = 'general') {
        Cache::forget('setting_' . $key);
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );
    }

    public static function getGroup($group) {
        return self::where('group', $group)->pluck('value', 'key')->toArray();
    }
}
