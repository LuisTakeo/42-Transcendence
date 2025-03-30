interface StudyTestsInterface {
    name: string;
    version: string;
    description: string;
    save(): void;
    load(): void;
}


class StudyTests implements StudyTestsInterface {
    name: string;
    version: string;
    description: string;

    constructor(name: string, version: string, description: string) {
        this.name = name;
        this.version = version;
        this.description = description;
    }
    save(): void {
        console.log('Saving study tests...');
    }
    load(): void {
        console.log('Loading study tests...');
    }
}

class StudyTestsAdapter {
    studyTests: StudyTestsInterface;

    constructor(studyTests: StudyTestsInterface) {
        this.studyTests = studyTests;
    }

    getName(): string {
        return this.studyTests.name;
    }

    getVersion(): string {
        return this.studyTests.version;
    }

    getDescription(): string {
        return this.studyTests.description;
    }

    save(): void {
        this.studyTests.save();
    }
}

const version: string = '0.0.1';
const myName: string = 'StudyTests';

const myStudy: StudyTests = new StudyTests(
    myName, version, 'Study tests for the project.');

const myStudyAdapter: StudyTestsAdapter = 
    new StudyTestsAdapter(myStudy);

console.log('Hello, world!');
console.log(myStudyAdapter)