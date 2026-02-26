import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiseaseLibraryEntity } from './entities/disease.entity';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

@Module({
    imports: [TypeOrmModule.forFeature([DiseaseLibraryEntity])],
    controllers: [LibraryController],
    providers: [LibraryService],
    exports: [LibraryService],
})
export class LibraryModule { }
