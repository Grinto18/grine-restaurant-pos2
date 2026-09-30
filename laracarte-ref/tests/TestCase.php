<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Testing\TestResponse;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        // Force SQLite for testing
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
        
        // Force Array Session Driver
        config(['session.driver' => 'array']);

        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure Livewire/Volt macros are registered if missing
        if (! TestResponse::hasMacro('assertSeeLivewire')) {
            TestResponse::macro('assertSeeLivewire', function ($component) {
                $escapedComponentName = trim(htmlspecialchars(json_encode(['name' => $component])), '{}');
                \PHPUnit\Framework\Assert::assertStringContainsString(
                    $escapedComponentName,
                    $this->getContent(),
                    'Cannot find Livewire component ['.$component.'] rendered on page.'
                );
                return $this;
            });
        }

        if (! TestResponse::hasMacro('assertSeeVolt')) {
            TestResponse::macro('assertSeeVolt', function ($component) {
                return $this->assertSeeLivewire($component);
            });
        }
    }
}
