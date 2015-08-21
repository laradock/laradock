<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Jobs\TestingQueue;
use App\Http\Requests;
use Exception;

/**
 * Class TestingController
 *
 * @package App\Http\Controllers
 * @author  Mahmoud Zalt <mahmoud@zalt.me>
 */
class TestingController extends Controller
{

    /**
     * Test some software's and respond to the user
     *
     * @return \Illuminate\View\View
     * @throws \Exception
     */
    public function test()
    {
        try {
            // Testing Database (MySQL)
            DB::connection()->getDatabaseName();

            // Testing Cache (Redis)
            Cache::pull('test');

            // Testing Queue (Beanstalkd)
            $this->dispatch(new TestingQueue());

            return view('welcome');
        } catch(Exception $e) {
            echo $e->getMessage();
        }
    }

}
